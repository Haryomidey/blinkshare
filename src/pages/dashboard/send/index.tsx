import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Keyboard, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { QRScannerPanel } from '@/components/transfer/QRScannerPanel.tsx';
import { FileDropzone } from '@/components/transfer/FileDropzone.tsx';
import { FileQueue } from '@/components/transfer/FileQueue.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { api } from '@/services/api.ts';

type SendState = 'initial' | 'scanning' | 'manual' | 'files';

export default function Send() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inviteCode = searchParams.get('session') ?? '';
    const [state, setState] = useState<SendState>(inviteCode ? 'manual' : 'initial');
    const [files, setFiles] = useState<File[]>([]);
    const [pairingCode, setPairingCode] = useState(inviteCode);
    const [isCreatingTransfer, setIsCreatingTransfer] = useState(false);
    const [isPairing, setIsPairing] = useState(false);
    const [isPaired, setIsPaired] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFilesAdded = (newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleConnect = async () => {
        if (files.length === 0) return;
        if (!isPaired || !pairingCode.trim()) {
            setError('Connect to a receiving device before starting the transfer.');
            return;
        }

        setIsCreatingTransfer(true);
        setError(null);

        try {
            const transfer = await api.createTransfer({
                files: files.map((file) => ({ name: file.name, size: file.size })),
                pairingCode: pairingCode.trim() || undefined,
            });

            navigate(`/app/session/${transfer.id}`, { state: { role: 'sender', files } });
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to start transfer');
        } finally {
            setIsCreatingTransfer(false);
        }
    };

    const handlePairDevice = async () => {
        if (!pairingCode.trim()) {
            setError('Enter the receive code shown on the other device.');
            return;
        }

        setIsPairing(true);
        setError(null);

        try {
            const session = await api.getReceiveSession(pairingCode.trim());
            if (session.status !== 'waiting') {
                setError('That receive code is no longer available. Create a new one on the receiving device.');
                return;
            }

            setIsPaired(true);
            setState('files');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to connect to that receive code');
        } finally {
            setIsPairing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Badge className="mb-4">Send</Badge>
                    <h1 className="text-4xl font-bold tracking-tighter text-black">Send Files</h1>
                    <p className="text-neutral-500 mt-2">Choose your files, then pair with the device that should receive them.</p>
                    {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
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
                                onChange={(e) => {
                                    setPairingCode(e.target.value);
                                    setIsPaired(false);
                                }}
                                className="font-mono uppercase text-lg"
                            />
                            <Button className="w-full" onClick={handlePairDevice} isLoading={isPairing}>
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

                    {!isPaired && (
                        <div className="rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            Pair with a receiving device before starting the transfer.
                        </div>
                    )}
                    
                    <FileQueue files={files} onRemove={handleRemoveFile} />

                    {files.length > 0 && (
                        <div className="pt-8">
                            <Button 
                                size="lg" 
                                className="w-full relative overflow-hidden group shadow-xl"
                                onClick={handleConnect}
                                isLoading={isCreatingTransfer}
                                disabled={!isPaired}
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
