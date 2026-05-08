import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, Download, Share2, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { TransferProgress } from '@/components/transfer/TransferProgress.tsx';
import { ConnectionStatus } from '@/components/transfer/ConnectionStatus.tsx';
import { useMockTransfer } from '@/hooks/useMockTransfer.ts';

export default function TransferSession() {
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [isConnected, setIsConnected] = useState(false);
    
    // Default file for demo if none passed via state
    const filesInState = location.state?.files || [
        { id: '1', name: 'Presentation_Draft.pdf', size: 45000000, progress: 0, status: 'waiting' },
        { id: '2', name: 'Assets_Folder.zip', size: 850000000, progress: 0, status: 'waiting' }
    ];

    const transfer = useMockTransfer(filesInState, isConnected);

    // Simulate initial connection delay
    useEffect(() => {
        const timer = setTimeout(() => setIsConnected(true), 2000);
        return () => clearTimeout(timer);
    }, []);

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
                {!transfer.isCompleted && (
                    <Button variant="outline" size="sm" onClick={() => navigate('/app')}>
                        Abort Session
                    </Button>
                )}
            </header>

            {!isConnected ? (
                <div className="py-20 flex flex-col items-center">
                    <ConnectionStatus status="connecting" />
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <TransferProgress 
                            files={transfer.files}
                            overallProgress={transfer.overallProgress}
                            speed={transfer.speed}
                            timeLeft={transfer.timeLeft}
                            isCompleted={transfer.isCompleted}
                        />
                        
                        {transfer.isCompleted && (
                            <div className="mt-8 p-8 bg-neutral-50 rounded-sm border-2 border-black flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-black mb-2">Transfer Successful</h3>
                                <p className="text-sm text-neutral-500 max-w-xs mb-8">
                                    All bits have been verified and successfully reached the recipient device.
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
                        <ConnectionStatus status="connected" deviceName="MacBook Pro 16" />
                        
                        <Card className="p-6 bg-neutral-50 border-neutral-200">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Network Info</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500">Protocol:</span>
                                    <span className="font-medium">WebRTC (Direct)</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500">Encryption:</span>
                                    <span className="font-medium">AES-GCM 256</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500">IP (Local):</span>
                                    <span className="font-mono">192.168.1.14:5512</span>
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
