import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
const maxBufferedAmount = 512 * 1024;
const lowBufferedAmount = 256 * 1024;

const downloadReceivedFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const useWebRTCFileTransfer = ({ transfer, role, localFiles = [] }: UseWebRTCFileTransferOptions) => {
    const [connectionState, setConnectionState] = useState<'waiting' | 'connecting' | 'connected' | 'completed' | 'failed'>('waiting');
    const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const channelRef = useRef<RTCDataChannel | null>(null);
    const hasStartedSendingRef = useRef(false);
    const isPausedRef = useRef(false);
    const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const removedFileIdsRef = useRef(new Set<string>());
    const transferRef = useRef<Transfer | null>(transfer);
    const chunksRef = useRef<ArrayBuffer[]>([]);
    const activeFileRef = useRef<{ id: string; name: string; size: number; receivedBytes: number } | null>(null);

    useEffect(() => {
        transferRef.current = transfer;
    }, [transfer]);

    const pauseUploads = useCallback(() => {
        isPausedRef.current = true;
        setIsPaused(true);
    }, []);

    const resumeUploads = useCallback(() => {
        isPausedRef.current = false;
        setIsPaused(false);
    }, []);

    const waitWhilePaused = () => new Promise<void>((resolve) => {
        const check = () => {
            if (!isPausedRef.current) {
                resolve();
                return;
            }

            window.setTimeout(check, 150);
        };

        check();
    });

    const updateProgress = useCallback(async (
        bytesTransferred: number,
        files: FileProgressPatch[],
        status: Transfer['status'],
        speed = 0
    ) => {
        const currentTransfer = transferRef.current;
        if (!currentTransfer) return;

        await api.updateTransferProgress(currentTransfer.id, {
            bytesTransferred,
            progress: Math.min(100, (bytesTransferred / Math.max(currentTransfer.size, 1)) * 100),
            speed,
            status,
            files,
        }).catch(() => undefined);
    }, []);

    const waitForBufferedAmount = (channel: RTCDataChannel) => new Promise<void>((resolve) => {
        if (channel.bufferedAmount < maxBufferedAmount) {
            resolve();
            return;
        }

        channel.bufferedAmountLowThreshold = lowBufferedAmount;
        channel.onbufferedamountlow = () => resolve();
    });

    const sendFileBatch = useCallback(async (files: File[], transferFiles: TransferFile[]) => {
        const channel = channelRef.current;
        const currentTransfer = transferRef.current;
        if (!channel || channel.readyState !== 'open' || !currentTransfer || files.length === 0) return;

        setIsSending(true);
        setConnectionState('connected');
        await api.startTransfer(currentTransfer.id).catch(() => undefined);

        try {
            let batchSent = 0;
            let lastSent = 0;
            let lastTime = performance.now();

            for (const [index, file] of files.entries()) {
                const transferFile = transferFiles[index];
                if (!transferFile) continue;
                if (removedFileIdsRef.current.has(transferFile.id)) continue;

                channel.send(JSON.stringify({ type: 'file-start', id: transferFile.id, name: file.name, size: file.size }));

                let offset = 0;

                while (offset < file.size) {
                    await waitWhilePaused();

                    if (removedFileIdsRef.current.has(transferFile.id)) {
                        channel.send(JSON.stringify({ type: 'file-cancel', id: transferFile.id }));
                        break;
                    }

                    const slice = file.slice(offset, offset + chunkSize);
                    const buffer = await slice.arrayBuffer();
                    await waitForBufferedAmount(channel);
                    channel.send(buffer);
                    offset += buffer.byteLength;
                    batchSent += buffer.byteLength;

                    const now = performance.now();
                    if (now - lastTime > 1000 || offset >= file.size) {
                        const speed = Math.round(((batchSent - lastSent) / Math.max(now - lastTime, 1)) * 1000);
                        lastSent = batchSent;
                        lastTime = now;
                        const isFileComplete = offset >= file.size;
                        const isBatchComplete = isFileComplete && index === files.length - 1;

                        void updateProgress(batchSent, [{
                            id: transferFile.id,
                            progress: Math.min(100, (offset / Math.max(file.size, 1)) * 100),
                            status: isFileComplete ? 'completed' : 'transferring',
                        }], isBatchComplete ? 'completed' : 'transferring', speed);
                    }
                }

                if (!removedFileIdsRef.current.has(transferFile.id)) {
                    channel.send(JSON.stringify({ type: 'file-end', id: transferFile.id }));
                }
            }

            channel.send(JSON.stringify({ type: 'transfer-complete' }));
            setConnectionState('completed');
        } finally {
            setIsSending(false);
        }
    }, [updateProgress]);

    const addFiles = useCallback(async (files: File[]) => {
        const currentTransfer = transferRef.current;
        if (!currentTransfer || files.length === 0) return;

        const result = await api.addTransferFiles(currentTransfer.id, files);
        transferRef.current = result.transfer;
        await sendFileBatch(files, result.files);
    }, [sendFileBatch]);

    const removeFile = useCallback(async (fileId: string) => {
        const currentTransfer = transferRef.current;
        if (!currentTransfer) return;

        removedFileIdsRef.current.add(fileId);
        channelRef.current?.send(JSON.stringify({ type: 'file-cancel', id: fileId }));
        const updatedTransfer = await api.removeTransferFile(currentTransfer.id, fileId);
        transferRef.current = updatedTransfer;
    }, []);

    useEffect(() => {
        if (!transfer) return;

        const socket = new WebSocket(realtimeUrl);
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        let offerRetryId = 0;

        socketRef.current = socket;
        peerRef.current = peer;
        setConnectionState('connecting');

        const sendSignal = (type: string, payload: unknown) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type, transferId: transfer.id, payload }));
            }
        };

        const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
            if (!peer.remoteDescription) {
                pendingIceCandidatesRef.current.push(candidate);
                return;
            }

            await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => undefined);
        };

        const flushPendingIceCandidates = async () => {
            const candidates = pendingIceCandidatesRef.current.splice(0);
            await Promise.all(candidates.map((candidate) => addIceCandidate(candidate)));
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
                    void sendFileBatch(localFiles, transfer.files.slice(0, localFiles.length));
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
                downloadReceivedFile(url, activeFile.name);
                chunksRef.current = [];
                activeFileRef.current = null;
            }

            if (message.type === 'file-cancel' && message.id === activeFileRef.current?.id) {
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
            if (role === 'sender') {
                void sendOffer();
                offerRetryId = window.setInterval(() => {
                    if (channelRef.current?.readyState === 'open') {
                        window.clearInterval(offerRetryId);
                        return;
                    }

                    void sendOffer().catch(() => undefined);
                }, 2000);
            }
        };

        socket.onmessage = async (message) => {
            const event = JSON.parse(message.data);

            if (event.type === 'signal:peer-joined' && role === 'sender') {
                await sendOffer();
            }

            if (event.type === 'signal:offer' && role === 'receiver') {
                await peer.setRemoteDescription(new RTCSessionDescription(event.payload));
                await flushPendingIceCandidates();
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                sendSignal('signal:answer', answer);
            }

            if (event.type === 'signal:answer' && role === 'sender') {
                await peer.setRemoteDescription(new RTCSessionDescription(event.payload));
                await flushPendingIceCandidates();
            }

            if (event.type === 'signal:ice') {
                await addIceCandidate(event.payload);
            }
        };

        return () => {
            window.clearInterval(offerRetryId);
            pendingIceCandidatesRef.current = [];
            socket.close();
            peer.close();
            receivedFiles.forEach((file) => URL.revokeObjectURL(file.url));
        };
    }, [transfer?.id, role]);

    return useMemo(
        () => ({
            addFiles,
            canSend: channelRef.current?.readyState === 'open',
            connectionState,
            isPaused,
            isSending,
            pauseUploads,
            receivedFiles,
            removeFile,
            resumeUploads,
        }),
        [addFiles, connectionState, isPaused, isSending, pauseUploads, receivedFiles, removeFile, resumeUploads]
    );
};
