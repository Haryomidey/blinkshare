import { useEffect, useMemo, useRef, useState } from 'react';
import { api, realtimeUrl } from '@/services/api.ts';
import type { Transfer, TransferFile } from '@/types/transfer.ts';

interface ReceivedFile {
    id: string;
    name: string;
    size: number;
    url: string;
}

interface UseWebRTCFileTransferOptions {
    transfer: Transfer | null;
    role: 'sender' | 'receiver';
    localFiles?: File[];
}

type FileProgressPatch = { id: string; progress: number; status: TransferFile['status'] };

const chunkSize = 16 * 1024;

export const useWebRTCFileTransfer = ({ transfer, role, localFiles = [] }: UseWebRTCFileTransferOptions) => {
    const [connectionState, setConnectionState] = useState<'waiting' | 'connecting' | 'connected' | 'completed' | 'failed'>('waiting');
    const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const channelRef = useRef<RTCDataChannel | null>(null);
    const hasStartedSendingRef = useRef(false);
    const chunksRef = useRef<ArrayBuffer[]>([]);
    const activeFileRef = useRef<{ id: string; name: string; size: number; receivedBytes: number } | null>(null);

    useEffect(() => {
        if (!transfer) return;

        const socket = new WebSocket(realtimeUrl);
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        socketRef.current = socket;
        peerRef.current = peer;
        setConnectionState('connecting');

        const sendSignal = (type: string, payload: unknown) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type, transferId: transfer.id, payload }));
            }
        };

        const sendOffer = async () => {
            if (role !== 'sender') return;
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            sendSignal('signal:offer', offer);
        };

        const attachChannel = (channel: RTCDataChannel) => {
            channelRef.current = channel;
            channel.binaryType = 'arraybuffer';
            channel.onopen = () => {
                setConnectionState('connected');
                if (role === 'sender' && !hasStartedSendingRef.current) {
                    hasStartedSendingRef.current = true;
                    void sendFiles(channel);
                }
            };
            channel.onclose = () => setConnectionState((current) => current === 'completed' ? current : 'waiting');
            channel.onerror = () => setConnectionState('failed');
            channel.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    handleControlMessage(JSON.parse(event.data));
                    return;
                }

                handleChunk(event.data);
            };
        };

        const updateProgress = async (
            bytesTransferred: number,
            files: FileProgressPatch[],
            status: Transfer['status'],
            speed = 0
        ) => {
            await api.updateTransferProgress(transfer.id, {
                bytesTransferred,
                progress: Math.min(100, (bytesTransferred / Math.max(transfer.size, 1)) * 100),
                speed,
                status,
                files,
            }).catch(() => undefined);
        };

        const waitForBufferedAmount = (channel: RTCDataChannel) => new Promise<void>((resolve) => {
            if (channel.bufferedAmount < 512 * 1024) {
                resolve();
                return;
            }

            channel.bufferedAmountLowThreshold = 256 * 1024;
            channel.onbufferedamountlow = () => resolve();
        });

        const sendFiles = async (channel: RTCDataChannel) => {
            let totalSent = 0;
            let lastSent = 0;
            let lastTime = performance.now();
            const progressFiles: FileProgressPatch[] = transfer.files.map((file) => ({
                id: file.id,
                progress: 0,
                status: 'waiting',
            }));

            await api.startTransfer(transfer.id).catch(() => undefined);

            for (const [index, file] of localFiles.entries()) {
                const transferFile = transfer.files[index];
                if (!transferFile) continue;

                channel.send(JSON.stringify({ type: 'file-start', id: transferFile.id, name: file.name, size: file.size }));

                let offset = 0;
                progressFiles[index] = { id: transferFile.id, progress: 0, status: 'transferring' };

                while (offset < file.size) {
                    const slice = file.slice(offset, offset + chunkSize);
                    const buffer = await slice.arrayBuffer();
                    await waitForBufferedAmount(channel);
                    channel.send(buffer);
                    offset += buffer.byteLength;
                    totalSent += buffer.byteLength;

                    const now = performance.now();
                    if (now - lastTime > 500 || offset >= file.size) {
                        const speed = Math.round(((totalSent - lastSent) / Math.max(now - lastTime, 1)) * 1000);
                        lastSent = totalSent;
                        lastTime = now;
                        progressFiles[index] = {
                            id: transferFile.id,
                            progress: Math.min(100, (offset / Math.max(file.size, 1)) * 100),
                            status: offset >= file.size ? 'completed' : 'transferring',
                        };
                        await updateProgress(totalSent, progressFiles, offset >= file.size && index === localFiles.length - 1 ? 'completed' : 'transferring', speed);
                    }
                }

                channel.send(JSON.stringify({ type: 'file-end', id: transferFile.id }));
            }

            channel.send(JSON.stringify({ type: 'transfer-complete' }));
            await updateProgress(transfer.size, progressFiles.map((file) => ({ ...file, progress: 100, status: 'completed' })), 'completed');
            setConnectionState('completed');
        };

        const handleControlMessage = (message: { type: string; id?: string; name?: string; size?: number }) => {
            if (message.type === 'file-start' && message.id && message.name && typeof message.size === 'number') {
                activeFileRef.current = { id: message.id, name: message.name, size: message.size, receivedBytes: 0 };
                chunksRef.current = [];
            }

            if (message.type === 'file-end' && activeFileRef.current) {
                const activeFile = activeFileRef.current;
                const blob = new Blob(chunksRef.current);
                const url = URL.createObjectURL(blob);
                setReceivedFiles((current) => [...current, { ...activeFile, url }]);
                chunksRef.current = [];
                activeFileRef.current = null;
            }

            if (message.type === 'transfer-complete') {
                setConnectionState('completed');
            }
        };

        const handleChunk = (chunk: ArrayBuffer) => {
            const activeFile = activeFileRef.current;
            if (!activeFile || !transfer) return;

            chunksRef.current.push(chunk);
            activeFile.receivedBytes += chunk.byteLength;

            const filePatches = transfer.files.map((file) => {
                if (file.id !== activeFile.id) {
                    return { id: file.id, progress: file.progress, status: file.status };
                }

                return {
                    id: file.id,
                    progress: Math.min(100, (activeFile.receivedBytes / Math.max(activeFile.size, 1)) * 100),
                    status: activeFile.receivedBytes >= activeFile.size ? 'completed' as const : 'transferring' as const,
                };
            });

            const previousFiles = receivedFiles.reduce((total, file) => total + file.size, 0);
            void updateProgress(previousFiles + activeFile.receivedBytes, filePatches, 'transferring');
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) sendSignal('signal:ice', event.candidate);
        };

        peer.ondatachannel = (event) => attachChannel(event.channel);

        if (role === 'sender') {
            attachChannel(peer.createDataChannel('files', { ordered: true }));
        }

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'signal:join', transferId: transfer.id, role }));
            if (role === 'sender') void sendOffer();
        };

        socket.onmessage = async (message) => {
            const event = JSON.parse(message.data);

            if (event.type === 'signal:peer-joined' && role === 'sender') {
                await sendOffer();
            }

            if (event.type === 'signal:offer' && role === 'receiver') {
                await peer.setRemoteDescription(new RTCSessionDescription(event.payload));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                sendSignal('signal:answer', answer);
            }

            if (event.type === 'signal:answer' && role === 'sender') {
                await peer.setRemoteDescription(new RTCSessionDescription(event.payload));
            }

            if (event.type === 'signal:ice') {
                await peer.addIceCandidate(new RTCIceCandidate(event.payload)).catch(() => undefined);
            }
        };

        return () => {
            socket.close();
            peer.close();
            receivedFiles.forEach((file) => URL.revokeObjectURL(file.url));
        };
    }, [transfer?.id, role]);

    return useMemo(() => ({ connectionState, receivedFiles }), [connectionState, receivedFiles]);
};
