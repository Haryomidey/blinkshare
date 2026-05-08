import { Camera, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';

export const QRScannerPanel = () => {
    return (
        <div className="flex flex-col items-center w-full max-w-sm">
            <Card className="relative w-full aspect-square bg-neutral-900 overflow-hidden flex items-center justify-center">
                {/* Camera View Placeholder */}
                <div className="absolute inset-0 opacity-20">
                    <img 
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" 
                        alt="Camera simulation"
                        className="w-full h-full object-cover grayscale"
                    />
                </div>
                
                {/* Scanning HUD */}
                <div className="relative z-10 w-64 h-64 border-2 border-white/50 rounded-lg">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-scan" />
                </div>
                
                <div className="absolute bottom-6 flex gap-4 z-20">
                    <Button variant="secondary" size="icon" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                </div>
            </Card>
            
            <div className="mt-8 text-center">
                <p className="text-sm text-neutral-500 max-w-[240px]">
                    Center the QR code in the frame to connect instantly.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-black uppercase tracking-wider justify-center">
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    Camera Active
                </div>
            </div>
        </div>
    );
};
