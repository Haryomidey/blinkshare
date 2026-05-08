import { useMemo, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Download } from 'lucide-react';
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
    const role = (location.state as { role?: 'sender' | 'receiver'; files?: File[] } | null)?.role ?? 'receiver';
    const localFiles = (location.state as { files?: File[] } | null)?.files ?? [];
    const { connectionState, receivedFiles } = useWebRTCFileTransfer({ transfer, role, localFiles });

    const timeLeft = useMemo(() => {
        if (!transfer || transfer.speed <= 0) return 0;
        const completedBytes = transfer.files.reduce((total, file) => total + (file.progress / 100) * file.size, 0);
        return Math.max(0, (transfer.size - completedBytes) / transfer.speed);
    }, [transfer]);

    const isCompleted = transfer?.status === 'completed';
    const isConnected = Boolean(transfer && connectionState !== 'waiting' && connectionState !== 'connecting');

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/app" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge>Active Session</Badge>
                            <span className="text-[10px] font-mono text-neutral-400">ID: {sessionId}</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter text-black">Direct Share</h1>
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

            {isLoading || !isConnected || !transfer ? (
                <div className="py-20 flex flex-col items-center">
                    <ConnectionStatus status="connecting" />
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <TransferProgress 
                            files={transfer.files}
                            overallProgress={transfer.progress}
                            bytesTransferred={transfer.bytesTransferred ?? 0}
                            totalBytes={transfer.size}
                            speed={transfer.speed}
                            timeLeft={timeLeft}
                            isCompleted={isCompleted}
                        />
                        
                        {isCompleted && (
                            <div className="mt-8 p-8 bg-neutral-50 rounded-sm border-2 border-black flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-black mb-2">Share Recorded</h3>
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

                    <div className="space-y-6">
                        <ConnectionStatus status="connected" deviceName={transfer.receiver ?? transfer.sender ?? 'Paired device'} />

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
                        
                        <Card className="p-6 bg-neutral-50 border-neutral-200">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Network Info</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500">Protocol:</span>
                                    <span className="font-medium">Realtime signaling</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500">Encryption:</span>
                                    <span className="font-medium">Browser session</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500">Transfer:</span>
                                    <span className="font-mono">{transfer.id}</span>
                                </div>
                            </div>
                        </Card>

                        <div className="p-6 border border-neutral-100 rounded-sm text-center">
                            <Download className="w-5 h-5 text-neutral-300 mx-auto mb-4" />
                                <p className="text-xs text-neutral-400">
                                Keep both browser windows open until all files are available on the receiver.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {transfer && (
                <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Share Report">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</p>
                                <p className="mt-1 text-sm font-medium text-black">{transfer.status}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Session ID</p>
                                <p className="mt-1 text-sm font-mono text-black">{transfer.id}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Shared Size</p>
                                <p className="mt-1 text-sm font-medium text-black">
                                    {formatFileSize(transfer.bytesTransferred ?? 0)} / {formatFileSize(transfer.size)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Created</p>
                                <p className="mt-1 text-sm font-medium text-black">{formatDate(transfer.createdAt)}</p>
                            </div>
                        </div>

                        <div className="rounded-sm border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-bold text-amber-900">File delivery is not active yet</p>
                            <p className="mt-1 text-xs leading-relaxed text-amber-800">
                                Files are sent directly between the paired browsers using a WebRTC DataChannel. Keep both browser windows open until the session finishes.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {transfer.files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between gap-4 rounded-sm border border-neutral-100 p-3">
                                    <p className="min-w-0 truncate text-sm font-medium text-black">{file.name}</p>
                                    <p className="shrink-0 text-xs font-mono text-neutral-500">
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
