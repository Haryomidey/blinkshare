import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Keyboard, ArrowRight, Zap, RefreshCw } from 'lucide-react';
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
                    <Badge className="mb-4">Send</Badge>
                    <h1 className="text-4xl font-bold tracking-tighter text-black">Send Files</h1>
                    <p className="text-neutral-500 mt-2">Choose your files, then pair with the device that should receive them.</p>
                </div>
                {state !== 'initial' && (
                    <Button variant="ghost" size="sm" onClick={() => setState('initial')}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Start Over
                    </Button>
                )}
            </header>

            <div className="grid md:grid-cols-5 gap-8">
                {/* Step 1: Connect */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-sm bg-black text-white flex items-center justify-center font-bold text-xs">01</div>
                        <h2 className="font-bold text-black uppercase tracking-tight">Pair Device</h2>
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
                                        <p className="text-xs text-neutral-500">Use the QR code on the receiving device.</p>
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
                                        <p className="text-xs text-neutral-500">Type the code shown on the receiving device.</p>
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
                                label="Pairing Code" 
                                placeholder="E.G. BLINK-XXXX" 
                                value={pairingCode}
                                onChange={(e) => setPairingCode(e.target.value)}
                                className="font-mono uppercase text-lg"
                            />
                            <Button className="w-full" onClick={() => {}}>
                                Connect Device
                            </Button>
                            <p className="text-xs text-center text-neutral-400 font-medium leading-relaxed">
                                The code is only used to connect these two devices.
                            </p>
                        </Card>
                    )}
                </div>

                {/* Step 2: Files */}
                <div className="md:col-span-3 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-sm bg-black text-white flex items-center justify-center font-bold text-xs">02</div>
                        <h2 className="font-bold text-black uppercase tracking-tight">Choose Files</h2>
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
                                    Start Transfer
                                    <Zap className="w-5 h-5 fill-white" />
                                </span>
                                <div className="absolute top-0 right-0 w-32 h-full bg-white/10 skew-x-[45deg] translate-x-16 group-hover:translate-x-0 transition-transform duration-500" />
                            </Button>
                            <p className="text-center text-xs mt-4 text-neutral-400 font-medium leading-relaxed">
                                Keep this tab open until the transfer finishes.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
