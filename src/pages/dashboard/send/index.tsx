import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Keyboard, ArrowRight, Zap, RefreshCw, Info, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { QRScannerPanel } from '@/components/transfer/QRScannerPanel.tsx';
import { FileDropzone } from '@/components/transfer/FileDropzone.tsx';
import { FileQueue } from '@/components/transfer/FileQueue.tsx';
import { api } from '@/services/api.ts';

type SendState = 'initial' | 'scanning' | 'manual' | 'files';

const getPairingSuffix = (value: string) =>
    value.trim().toUpperCase().replace(/^BLINK[-\s]?/i, '').replace(/[^A-Z0-9]/g, '');

const getPairingCode = (value: string) => `BLINK-${getPairingSuffix(value)}`;

export default function Send() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inviteCode = searchParams.get('session') ?? '';
    const [state, setState] = useState<SendState>(inviteCode ? 'manual' : 'initial');
    const [files, setFiles] = useState<File[]>([]);
    const [pairingCode, setPairingCode] = useState(getPairingSuffix(inviteCode));
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
                pairingCode: getPairingCode(pairingCode),
            });

            navigate(`/app/session/${transfer.id}`, { state: { role: 'sender', files } });
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to start transfer');
        } finally {
            setIsCreatingTransfer(false);
        }
    };

    const handlePairDevice = async (codeOverride?: string) => {
        const code = getPairingSuffix(codeOverride ?? pairingCode);

        if (!code) {
            setError('Enter the receive code shown on the other device.');
            return;
        }

        setIsPairing(true);
        setError(null);
        setPairingCode(code);

        try {
            const session = await api.pairReceiveSession(getPairingCode(code));
            if (session.transferId) {
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
        <div className="mx-auto max-w-4xl min-w-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="min-w-0">
                    <Badge className="mb-4">Send</Badge>
                    <h1 className="text-3xl font-bold tracking-tighter text-black sm:text-4xl">Send Files</h1>
                    <p className="mt-2 text-sm text-neutral-500 sm:text-base">Choose your files, then pair with the device that should receive them.</p>
                    {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
                </div>
                {state !== 'initial' && (
                    <Button variant="ghost" size="sm" onClick={() => setState('initial')}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Start Over
                    </Button>
                )}
            </header>

            <div className="grid min-w-0 gap-8 md:grid-cols-5">
                {/* Step 1: Connect */}
                <div className="min-w-0 space-y-6 md:col-span-2">
                    <div className="flex items-center justify-center gap-3 mb-6 md:justify-start">
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
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-sm flex items-center justify-center group-hover:bg-black transition-colors">
                                        <Camera className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
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
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-sm flex items-center justify-center group-hover:bg-black transition-colors">
                                        <Keyboard className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm tracking-tight text-black">Enter Pairing Code</h3>
                                        <p className="text-xs text-neutral-500">Type the code shown on the receiving device.</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </div>
                            </Card>
                        </div>
                    )}

                    {state === 'scanning' && (
                        <QRScannerPanel onCodeDetected={(code) => void handlePairDevice(code)} />
                    )}

                    {state === 'manual' && (
                        <Card className="p-8 space-y-6 border-2 border-black">
                            <div className="min-w-0 space-y-1.5">
                                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                    Pairing Code
                                </label>
                                <div className="flex min-w-0 overflow-hidden rounded-sm border border-neutral-200 bg-white focus-within:border-black">
                                    <span className="flex shrink-0 items-center border-r border-neutral-200 bg-neutral-50 px-3 font-mono text-base font-bold text-neutral-500 sm:text-lg">
                                        BLINK-
                                    </span>
                                    <input
                                        value={pairingCode}
                                        inputMode="text"
                                        autoCapitalize="characters"
                                        autoComplete="off"
                                        placeholder="1453"
                                        onChange={(event) => {
                                            setPairingCode(getPairingSuffix(event.target.value));
                                            setIsPaired(false);
                                        }}
                                        className="min-w-0 flex-1 px-4 py-2.5 font-mono text-base uppercase text-black placeholder:text-neutral-300 focus:outline-none sm:text-lg"
                                    />
                                </div>
                            </div>
                            <Button className="w-full" onClick={() => void handlePairDevice()} isLoading={isPairing}>
                                Connect Device
                            </Button>
                            <p className="text-xs text-center text-neutral-400 font-medium leading-relaxed">
                                The code is only used to connect these two devices.
                            </p>
                        </Card>
                    )}

                    {isPaired && (
                        <Card className="border-2 border-black bg-neutral-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-black text-white">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-black">Receiver connected</p>
                                    <p className="text-xs text-neutral-500">Both devices are paired. Choose files to continue.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Step 2: Files */}
                <div className="min-w-0 space-y-6 md:col-span-3">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-sm bg-black text-white flex items-center justify-center font-bold text-xs">02</div>
                        <h2 className="font-bold text-black uppercase tracking-tight">Choose Files</h2>
                    </div>

                    <FileDropzone onFilesAdded={handleFilesAdded} selectedFiles={files} />

                    {!isPaired && (
                        <div className="flex gap-3 rounded-sm border border-neutral-200 bg-neutral-50 p-4">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-black text-white">
                                <Info className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-black">Pair a receiver first</p>
                                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                    Open Receive on the other device, then scan its QR code or enter its pairing code.
                                </p>
                            </div>
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
