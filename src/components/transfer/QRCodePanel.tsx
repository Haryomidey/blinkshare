import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { createQrMatrix } from '@/lib/qrCode.ts';

interface QRCodePanelProps {
    value: string;
}

export const QRCodePanel = ({ value }: QRCodePanelProps) => {
    const matrix = useMemo(() => createQrMatrix(value), [value]);
    const [copied, setCopied] = useState(false);
    const canCopy = value.trim().length > 0 && value !== 'Loading...';

    const copySessionId = async () => {
        if (!canCopy) return;

        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex flex-col items-center">
            <Card className="aspect-square w-full max-w-70 border-2 border-black bg-white p-7">
                <div
                    className="grid h-full w-full bg-white p-[8%]"
                    style={{
                        gridTemplateColumns: `repeat(${matrix.length}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${matrix.length}, minmax(0, 1fr))`,
                    }}
                    role="img"
                    aria-label={`QR code for session ${value}`}
                >
                    {matrix.flatMap((row, y) =>
                        row.map((isDark, x) => (
                            <span
                                key={`${x}-${y}`}
                                className={isDark ? 'bg-black' : 'bg-white'}
                                aria-hidden="true"
                            />
                        ))
                    )}
                </div>
            </Card>
            <div className="mt-6 text-center">
                <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-1">Session ID</p>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-xl font-bold tracking-tight text-black sm:text-2xl">{value}</p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-neutral-500 hover:text-black"
                        onClick={() => void copySessionId()}
                        disabled={!canCopy}
                        aria-label="Copy session ID"
                        title="Copy session ID"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};
