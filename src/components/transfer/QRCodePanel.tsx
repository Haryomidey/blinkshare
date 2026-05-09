import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';

interface QRCodePanelProps {
    value: string;
}

export const QRCodePanel = ({ value }: QRCodePanelProps) => {
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const canCopy = value.trim().length > 0 && value !== 'Loading...';
    const shortCode = value.replace(/^BLINK-/i, '');

    useEffect(() => {
        if (!canCopy) {
            setQrDataUrl('');
            return;
        }

        let isMounted = true;
        QRCode.toDataURL(value, {
            errorCorrectionLevel: 'M',
            margin: 4,
            scale: 10,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        }).then((dataUrl) => {
            if (isMounted) setQrDataUrl(dataUrl);
        }).catch(() => {
            if (isMounted) setQrDataUrl('');
        });

        return () => {
            isMounted = false;
        };
    }, [canCopy, value]);

    const copySessionId = async () => {
        if (!canCopy) return;

        await navigator.clipboard.writeText(shortCode);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex w-full min-w-0 flex-col items-center">
            <Card className="aspect-square w-full max-w-[62vw] border-2 border-black bg-white p-3 sm:max-w-[17.5rem] sm:p-5">
                {qrDataUrl ? (
                    <img
                        src={qrDataUrl}
                        alt={`QR code for session ${value}`}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-neutral-400">
                        Loading...
                    </div>
                )}
            </Card>
            <div className="mt-4 text-center sm:mt-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-neutral-400 sm:text-sm">Session ID</p>
                <div className="flex min-w-0 items-center justify-center gap-2">
                    <p className="min-w-0 break-all text-lg font-bold tracking-tight text-black sm:text-2xl">{value}</p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-neutral-500 hover:text-black"
                        onClick={() => void copySessionId()}
                        disabled={!canCopy}
                        aria-label="Copy session code"
                        title="Copy code"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};
