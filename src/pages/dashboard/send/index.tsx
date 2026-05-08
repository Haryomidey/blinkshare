import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Smartphone, Keyboard, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { QRScannerPanel } from '@/components/transfer/QRScannerPanel.tsx';
import { FileDropzone } from '@/components/transfer/FileDropzone.tsx';
import { FileQueue } from '@/components/transfer/FileQueue.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { generateId } from '@/lib/formatters.ts';

type SendState = 'initial' | 'scanning' | 'manual' | 'files';

export default function Send() {
    const navigate = useNavigate();
    const [state, setState] = useState<SendState>('initial');
    const [files, setFiles] = useState<File[]>([]);
    const [pairingCode, setPairingCode] = useState('');

    const handleFilesAdded = (newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleConnect = () => {
        const sessionId = generateId();
        // In a real app, logic to start session with WebRTC would go here
        navigate(`/app/session/${sessionId}`, { state: { files: files.map(f => ({ name: f.name, size: f.size, progress: 0, status: 'waiting' })) } });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Badge className="mb-4">Send Module</Badge>
                    <h1 className="text-4xl font-bold tracking-tighter text-black">Prepare Transfer</h1>
                    <p className="text-neutral-500 mt-2">Connect a recipient to begin direct file sharing.</p>
                </div>
                {state !== 'initial' && (
                    <Button variant="ghost" size="sm" onClick={() => setState('initial')}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restart Setup
                    </Button>
                )}
            </header>

            <div className="grid md:grid-cols-5 gap-8">
                {/* Step 1: Connect */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-sm bg-black text-white flex items-center justify-center font-bold text-xs">01</div>
                        <h2 className="font-bold text-black uppercase tracking-tight">Connect Device</h2>
                    </div>

                    {state === 'initial' && (
                        <div className="space-y-4">
                            <Card 
                                onClick={() => setState('scanning')}
                                hover 
                                className="p-6 cursor-pointer group border-2 border-transparent hover:border-black transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-sm flex items-center justify-center group-hover:bg-black transition-colors">
                                        <Camera className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm tracking-tight text-black">Scan QR Code</h3>
                                        <p className="text-xs text-neutral-500">Fastest p2p pairing method.</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </div>
                            </Card>

                            <Card 
                                onClick={() => setState('manual')}
                                hover 
                                className="p-6 cursor-pointer group border-2 border-transparent hover:border-black transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-sm flex items-center justify-center group-hover:bg-black transition-colors">
                                        <Keyboard className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm tracking-tight text-black">Enter Pairing Code</h3>
                                        <p className="text-xs text-neutral-500">Connect via 8-digit unique key.</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </div>
                            </Card>
                        </div>
                    )}

                    {state === 'scanning' && <QRScannerPanel />}

                    {state === 'manual' && (
                        <Card className="p-8 space-y-6 border-2 border-black">
                            <Input 
                                label="Session Pairing Code" 
                                placeholder="E.G. BLINK-XXXX" 
                                value={pairingCode}
                                onChange={(e) => setPairingCode(e.target.value)}
                                className="font-mono uppercase text-lg"
                            />
                            <Button className="w-full" onClick={() => {}}>
                                Authenticate Session
                            </Button>
                            <p className="text-[10px] text-center text-neutral-400 uppercase tracking-widest ont-medium">
                                Secured by signal handshake v2
                            </p>
                        </Card>
                    )}
                </div>

                {/* Step 2: Files */}
                <div className="md:col-span-3 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-sm bg-black text-white flex items-center justify-center font-bold text-xs">02</div>
                        <h2 className="font-bold text-black uppercase tracking-tight">Select Data</h2>
                    </div>

                    <FileDropzone onFilesAdded={handleFilesAdded} />
                    
                    <FileQueue files={files} onRemove={handleRemoveFile} />

                    {files.length > 0 && (
                        <div className="pt-8">
                            <Button 
                                size="lg" 
                                className="w-full relative overflow-hidden group shadow-xl"
                                onClick={handleConnect}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Initialize Direct Share
                                    <Zap className="w-5 h-5 fill-white" />
                                </span>
                                <div className="absolute top-0 right-0 w-32 h-full bg-white/10 skew-x-[45deg] translate-x-16 group-hover:translate-x-0 transition-transform duration-500" />
                            </Button>
                            <p className="text-center text-[10px] mt-4 text-neutral-400 uppercase tracking-[0.2em] font-medium leading-relaxed">
                                Once clicked, your browser will establish a direct signaling handshake with the recipient.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
