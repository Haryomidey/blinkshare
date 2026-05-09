import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';

interface QRScannerPanelProps {
    onCodeDetected?: (code: string) => void;
}

type BarcodeDetectorShape = {
    detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorShape;

const extractPairingCode = (rawValue: string) => {
    const urlMatch = rawValue.match(/[?&]session=([^&]+)/i);
    if (urlMatch) return decodeURIComponent(urlMatch[1]).toUpperCase();

    const codeMatch = rawValue.match(/BLINK-[A-Z0-9]+/i);
    return codeMatch?.[0].toUpperCase() ?? rawValue.trim().toUpperCase();
};

const getCameraStream = async () => {
    try {
        return await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: 'environment' } },
            audio: false,
        });
    } catch {
        return navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
        });
    }
};

export const QRScannerPanel = ({ onCodeDetected }: QRScannerPanelProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectedRef = useRef(false);
    const onCodeDetectedRef = useRef(onCodeDetected);
    const [status, setStatus] = useState('Starting camera...');
    const [isSupported, setIsSupported] = useState(Boolean(navigator.mediaDevices?.getUserMedia));
    const [scannerRun, setScannerRun] = useState(0);

    useEffect(() => {
        onCodeDetectedRef.current = onCodeDetected;
    }, [onCodeDetected]);

    useEffect(() => {
        let isMounted = true;
        let frameId = 0;
        detectedRef.current = false;

        const startScanner = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setIsSupported(false);
                setStatus('Camera scanning is not available in this browser. Enter the code manually.');
                return;
            }

            const BarcodeDetector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;

            try {
                const stream = await getCameraStream();
                streamRef.current = stream;

                if (!videoRef.current) return;
                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                const detector = BarcodeDetector ? new BarcodeDetector({ formats: ['qr_code'] }) : null;
                setStatus('Point your camera at the receive code.');

                const detectWithCanvas = () => {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

                    const width = video.videoWidth;
                    const height = video.videoHeight;
                    if (!width || !height) return null;

                    canvas.width = width;
                    canvas.height = height;
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    if (!context) return null;

                    context.drawImage(video, 0, 0, width, height);
                    let imageData = context.getImageData(0, 0, width, height);
                    const normalResult = jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' })?.data;
                    if (normalResult) return normalResult;

                    context.clearRect(0, 0, width, height);
                    context.save();
                    context.translate(width, 0);
                    context.scale(-1, 1);
                    context.drawImage(video, 0, 0, width, height);
                    context.restore();
                    imageData = context.getImageData(0, 0, width, height);
                    return jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' })?.data ?? null;
                };

                const scan = async () => {
                    if (!isMounted || !videoRef.current || detectedRef.current) return;

                    try {
                        const results = detector ? await detector.detect(videoRef.current) : [];
                        const rawValue = results[0]?.rawValue ?? detectWithCanvas();

                        if (rawValue) {
                            const code = extractPairingCode(rawValue);
                            detectedRef.current = true;
                            setStatus(`Detected ${code}`);
                            onCodeDetectedRef.current?.(code);
                            return;
                        }
                    } catch {
                        const rawValue = detectWithCanvas();
                        if (rawValue) {
                            const code = extractPairingCode(rawValue);
                            detectedRef.current = true;
                            setStatus(`Detected ${code}`);
                            onCodeDetectedRef.current?.(code);
                            return;
                        }
                    }

                    setStatus('Looking for a QR code...');
                    frameId = window.setTimeout(scan, 250);
                };

                void scan();
            } catch {
                setStatus('Camera permission is needed to scan. You can enter the code manually.');
            }
        };

        void startScanner();

        return () => {
            isMounted = false;
            window.clearTimeout(frameId);
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, [scannerRun]);

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col items-center md:mx-0">
            <Card className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-neutral-950">
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full -scale-x-100 object-cover opacity-70"
                />
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.09),transparent_45%)]" />
                <div className="absolute inset-0 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)]" />
                <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black to-transparent" />

                <div className="relative z-10 h-[68%] w-[68%] rounded-lg border border-white/60">
                    <div className="absolute -left-1 -top-1 h-10 w-10 border-l-4 border-t-4 border-white" />
                    <div className="absolute -right-1 -top-1 h-10 w-10 border-r-4 border-t-4 border-white" />
                    <div className="absolute -bottom-1 -left-1 h-10 w-10 border-b-4 border-l-4 border-white" />
                    <div className="absolute -bottom-1 -right-1 h-10 w-10 border-b-4 border-r-4 border-white" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-scan" />
                    <div className="absolute inset-0 rounded-lg bg-white/3" />
                </div>
                
                <div className="absolute bottom-6 flex gap-4 z-20">
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => {
                            setStatus('Restarting camera...');
                            setScannerRun((current) => current + 1);
                        }}
                        aria-label="Restart scanner"
                        title="Restart scanner"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                </div>
            </Card>
            
            <div className="mt-8 text-center">
                <p className="max-w-60 text-sm text-neutral-500">
                    {status}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-black uppercase tracking-wider justify-center">
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    {isSupported ? 'Camera Active' : 'Manual Entry Required'}
                </div>
            </div>
        </div>
    );
};