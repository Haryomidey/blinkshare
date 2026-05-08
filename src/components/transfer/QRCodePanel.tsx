import { QrCode } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';

interface QRCodePanelProps {
    value: string;
}

export const QRCodePanel = ({ value }: QRCodePanelProps) => {
    return (
        <div className="flex flex-col items-center">
            <Card className="p-8 aspect-square flex items-center justify-center bg-white border-2 border-black max-w-[280px]">
                <div className="relative">
                    {/* Simulated QR Code */}
                    <QrCode className="w-48 h-48 text-black" strokeWidth={1} />
                    {/* Decorative corners */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-black" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-black" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-black" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-black" />
                </div>
            </Card>
            <div className="mt-6 text-center">
                <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-1">Session ID</p>
                <p className="text-2xl font-bold tracking-tighter text-black font-mono">{value}</p>
            </div>
        </div>
    );
};
