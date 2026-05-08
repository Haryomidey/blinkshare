import { Smartphone, Laptop, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { cn } from '@/lib/utils.ts';

interface ConnectionStatusProps {
    status: 'connecting' | 'connected' | 'disconnected';
    deviceName?: string;
    deviceType?: 'mobile' | 'desktop';
}

export const ConnectionStatus = ({ status, deviceName = "Unknown Device", deviceType = 'desktop' }: ConnectionStatusProps) => {
    return (
        <Card className="p-10 flex flex-col items-center text-center bg-white border-2 border-black shadow-xl">
            <div className="relative mb-8">
                <div className={cn(
                    "w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500",
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
            
            <p className="text-[10px] uppercase font-bold tracking-[.3em] text-neutral-400 mb-2">Recipient</p>
            <h3 className="text-2xl font-bold tracking-tight text-black">{deviceName}</h3>
            <p className="text-sm text-neutral-500 mt-2">
                {status === 'connected' ? 'Receiver paired. Keep both pages open while files move.' : 'Waiting for receiver pairing...'}
            </p>
        </Card>
    );
};
