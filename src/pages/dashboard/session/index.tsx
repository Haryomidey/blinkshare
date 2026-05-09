import { useMemo, useRef, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Info, Upload, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { TransferProgress } from '@/components/transfer/TransferProgress.tsx';
import { ConnectionStatus } from '@/components/transfer/ConnectionStatus.tsx';
import { useRealtimeTransfer } from '@/hooks/useRealtimeTransfer.ts';
import { useWebRTCFileTransfer } from '@/hooks/useWebRTCFileTransfer.ts';
import { api } from '@/services/api.ts';
import { formatDate, formatFileSize } from '@/lib/formatters.ts';

export default function TransferSession() {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { transfer, isLoading, error } = useRealtimeTransfer(sessionId);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const role = (location.state as { role?: 'sender' | 'receiver'; files?: File[] } | null)?.role ?? 'receiver';
    const localFiles = (location.state as { files?: File[] } | null)?.files ?? [];
    const {
        addFiles,
        canSend,
        connectionState,
        isPaused,
        isSending,
        pauseUploads,
        receivedFiles,
        removeFile,
        resumeUploads,
    } = useWebRTCFileTransfer({ transfer, role, localFiles });

    const displayProgress = transfer
        ? Math.min(100, ((transfer.bytesTransferred ?? 0) / Math.max(transfer.size, 1)) * 100)
        : 0;
    const isTransferFullyShared = Boolean(
        transfer &&
        transfer.size > 0 &&
        (transfer.bytesTransferred ?? 0) >= transfer.size &&
        transfer.files.every((file) => file.progress >= 100 || file.status === 'completed')
    );
    const displayStatus = isTransferFullyShared ? transfer?.status : 'transferring';
    const displaySpeed = displayStatus === 'completed' ? 0 : transfer?.speed ?? 0;

    const timeLeft = useMemo(() => {
        if (!transfer || transfer.speed <= 0) return 0;
        return Math.max(0, (transfer.size - (transfer.bytesTransferred ?? 0)) / transfer.speed);
    }, [transfer]);

    const isCompleted = displayStatus === 'completed';
    const isConnected = Boolean(transfer && connectionState !== 'waiting' && connectionState !== 'connecting');
    const peerName = role === 'sender'
        ? transfer?.receiver ?? 'Receiver'
        : transfer?.sender ?? 'Sender';
    const peerLabel = role === 'sender' ? 'Recipient' : 'Sender';
    const connectionStatus = isConnected
        ? 'connected'
        : connectionState === 'failed' ? 'disconnected' : 'connecting';
    const waitingMessage = role === 'sender'
        ? 'Receiver is paired. Waiting for them to join the transfer screen...'
        : 'Waiting for sender to open the transfer connection...';

    const handleAddFiles = async (files: FileList | null) => {
        const selectedFiles = Array.from(files ?? []);
        if (selectedFiles.length === 0) return;

        setFileError(null);
        try {
            await addFiles(selectedFiles);
        } catch (requestError) {
            setFileError(requestError instanceof Error ? requestError.message : 'Unable to share those files');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="mx-auto max-w-4xl min-w-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <Link to="/app" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="min-w-0">
                        <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
                            <Badge>Active Session</Badge>
                            <span className="min-w-0 truncate text-[10px] font-mono text-neutral-400">ID: {sessionId}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tighter text-black sm:text-4xl">Direct Share</h1>
                    </div>
                </div>
                {!isCompleted && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                            if (sessionId) await api.cancelTransfer(sessionId).catch(() => undefined);
                            navigate('/app');
                        }}
                    >
                        Abort Session
                    </Button>
                )}
            </header>

            {error && (
                <Card className="p-4 border-red-100 bg-red-50 text-sm text-red-700">
                    {error}
                </Card>
            )}

            {isLoading || !transfer ? (
                <div className="py-20 flex flex-col items-center">
                    <ConnectionStatus
                        status="connecting"
                        deviceName={peerName}
                        label={peerLabel}
                        message={waitingMessage}
                    />
                </div>
            ) : (
                <div className="grid min-w-0 items-start gap-8 lg:grid-cols-3">
                    <div className="min-w-0 lg:col-span-2">
                        {!isConnected && !isCompleted && (
                            <Card className="mb-6 border-black bg-neutral-50 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-black text-white">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black">Waiting for connection</p>
                                        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                            {waitingMessage} The queue is ready and will start automatically once both tabs are on this page.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )}
                        <TransferProgress 
                            files={transfer.files}
                            overallProgress={displayProgress}
                            bytesTransferred={transfer.bytesTransferred ?? 0}
                            totalBytes={transfer.size}
                            speed={displaySpeed}
                            timeLeft={timeLeft}
                            isCompleted={isCompleted}
                            isConnected={isConnected}
                            isPaused={isPaused}
                            isSending={isSending}
                            onPause={pauseUploads}
                            onRemoveFile={(fileId) => void removeFile(fileId)}
                            onResume={resumeUploads}
                        />
                        
                        {isCompleted && (
                            <div className="mt-8 p-8 bg-neutral-50 rounded-sm border-2 border-black flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold tracking-tight text-black sm:text-2xl">Share Recorded</h3>
                                <p className="text-sm text-neutral-500 max-w-xs mb-8">
                                    {role === 'receiver' ? 'Files are ready to download below.' : 'The receiver has received the shared files.'}
                                </p>
                                <div className="flex gap-4">
                                    <Link to="/app">
                                        <Button size="md">Finish Session</Button>
                                    </Link>
                                    <Button variant="outline" size="md" onClick={() => setIsReportOpen(true)}>View Report</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 space-y-6">
                        <ConnectionStatus
                            status={connectionStatus}
                            deviceName={peerName}
                            label={peerLabel}
                            message={isConnected
                                ? 'Connected. Keep both pages open while files move.'
                                : waitingMessage}
                        />

                        <Card className="border-neutral-200 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-black text-white">
                                    <Upload className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-black">Share more files</h4>
                                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                        Either device can add one file or a batch while this session stays open.
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(event) => void handleAddFiles(event.target.files)}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="mt-4"
                                        isLoading={isSending}
                                        disabled={!canSend}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Add Files
                                    </Button>
                                    {fileError && <p className="mt-3 text-xs text-red-600">{fileError}</p>}
                                </div>
                            </div>
                        </Card>

                        {role === 'receiver' && receivedFiles.length > 0 && (
                            <Card className="p-6 border-neutral-200">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Received Files</h4>
                                <div className="space-y-3">
                                    {receivedFiles.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.url}
                                            download={file.name}
                                            className="flex items-center justify-between gap-4 rounded-sm border border-neutral-100 p-3 text-sm font-medium text-black hover:border-black"
                                        >
                                            <span className="min-w-0 truncate">{file.name}</span>
                                            <span className="shrink-0 text-xs text-neutral-500">Download</span>
                                        </a>
                                    ))}
                                </div>
                            </Card>
                        )}
                        
                        <div className="flex gap-3 rounded-sm border border-neutral-200 bg-neutral-50 p-4">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white border border-neutral-200">
                                <Info className="h-4 w-4 text-neutral-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-black">Keep this tab open</p>
                                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                    The peer connection runs from this page. Leaving it will stop active transfers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {transfer && (
                <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Share Report">
                    <div className="min-w-0 space-y-6">
                        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</p>
                                <p className="mt-1 truncate text-sm font-medium text-black">{displayStatus}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Session ID</p>
                                <p className="mt-1 truncate text-sm font-mono text-black">{transfer.id}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Shared Size</p>
                                <p className="mt-1 truncate text-sm font-medium text-black">
                                    {formatFileSize(transfer.bytesTransferred ?? 0)} / {formatFileSize(transfer.size)}
                                </p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Created</p>
                                <p className="mt-1 truncate text-sm font-medium text-black">{formatDate(transfer.createdAt)}</p>
                            </div>
                        </div>

                        <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-4">
                            <p className="text-sm font-semibold text-black">Keep this page open</p>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                The transfer runs between the two browser tabs. Closing either tab will stop it.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {transfer.files.map((file) => (
                                <div key={file.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm border border-neutral-100 p-3">
                                    <p className="min-w-0 truncate text-sm font-medium text-black">{file.name}</p>
                                    <p className="shrink-0 whitespace-nowrap text-xs font-mono text-neutral-500">
                                        {formatFileSize(Math.round((file.progress / 100) * file.size))} / {formatFileSize(file.size)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
