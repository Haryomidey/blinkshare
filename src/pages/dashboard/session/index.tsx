import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { TransferProgress } from '@/components/transfer/TransferProgress.tsx';
import { ConnectionStatus } from '@/components/transfer/ConnectionStatus.tsx';
import { useRealtimeTransfer } from '@/hooks/useRealtimeTransfer.ts';
import { api } from '@/services/api.ts';

export default function TransferSession() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { transfer, isLoading, error } = useRealtimeTransfer(sessionId);

    const timeLeft = useMemo(() => {
        if (!transfer || transfer.speed <= 0) return 0;
        const completedBytes = transfer.files.reduce((total, file) => total + (file.progress / 100) * file.size, 0);
        return Math.max(0, (transfer.size - completedBytes) / transfer.speed);
    }, [transfer]);

    const isCompleted = transfer?.status === 'completed';
    const isConnected = Boolean(transfer && transfer.status !== 'waiting');

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
                            speed={transfer.speed}
                            timeLeft={timeLeft}
                            isCompleted={isCompleted}
                        />
                        
                        {isCompleted && (
                            <div className="mt-8 p-8 bg-neutral-50 rounded-sm border-2 border-black flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-black mb-2">Transfer Successful</h3>
                                <p className="text-sm text-neutral-500 max-w-xs mb-8">
                                    The transfer is complete and ready in your history.
                                </p>
                                <div className="flex gap-4">
                                    <Link to="/app">
                                        <Button size="md">Finish Session</Button>
                                    </Link>
                                    <Button variant="outline" size="md">View Report</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <ConnectionStatus status="connected" deviceName={transfer.receiver ?? transfer.sender ?? 'Paired device'} />
                        
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
                                Do not close this browser window until the transfer is complete to avoid packet loss.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
