import { Smartphone, Laptop, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { cn } from '@/lib/utils.ts';

interface ConnectionStatusProps {
    status: 'connecting' | 'connected' | 'disconnected';
    deviceName?: string;
    deviceType?: 'mobile' | 'desktop';
    label?: string;
    message?: string;
}

export const ConnectionStatus = ({
    status,
    deviceName = "Unknown Device",
    deviceType = 'desktop',
    label = 'Recipient',
    message,
}: ConnectionStatusProps) => {
    const statusMessage = message
        ?? (status === 'connected'
            ? 'Receiver paired. Keep both pages open while files move.'
            : 'Waiting for receiver to join the transfer...');

    return (
        <Card className="flex min-w-0 flex-col items-center bg-white p-6 text-center shadow-xl border-2 border-black sm:p-8">
            <div className="relative mb-6">
                <div className={cn(
                    "w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-500 sm:h-24 sm:w-24",
                    status === 'connected' ? "border-black bg-black" : "border-neutral-200 bg-white"
                )}>
                    {deviceType === 'desktop' ? (
                        <Laptop className={cn("w-10 h-10 transition-colors", status === 'connected' ? "text-white" : "text-neutral-300")} />
                    ) : (
                        <Smartphone className={cn("w-10 h-10 transition-colors", status === 'connected' ? "text-white" : "text-neutral-300")} />
                    )}
                </div>
                {status === 'connected' && (
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white border-2 border-black rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-black" fill="white" />
                    </div>
                )}
                {status === 'connecting' && (
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white border-2 border-black rounded-full">
                        <Loader2 className="w-6 h-6 text-black animate-spin" />
                    </div>
                )}
            </div>
            
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[.3em] text-neutral-400">{label}</p>
            <h3 className="max-w-full truncate text-xl font-bold tracking-tight text-black sm:text-2xl">{deviceName}</h3>
            <p className="mt-2 max-w-full text-sm text-neutral-500">
                {statusMessage}
            </p>
        </Card>
    );
};
