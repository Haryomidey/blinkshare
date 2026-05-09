import { motion } from 'motion/react';
import { Smartphone, QrCode, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';

export const QRPairingSection = () => {
    return (
        <section className="min-w-0 overflow-hidden border-y border-neutral-100 bg-neutral-50 px-4 py-20 sm:py-32">
            <div className="mx-auto grid max-w-6xl min-w-0 items-center gap-10 md:grid-cols-2 md:gap-16">
                <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-neutral-400 mb-4">Seamless Connection</p>
                    <h2 className="mb-4 text-2xl font-bold leading-[1.15] tracking-tight text-black sm:text-4xl lg:mb-8 lg:text-5xl">
                        Connect devices with a simple scan.
                    </h2>
                    <p className="mb-6 max-w-md text-xs leading-relaxed text-neutral-500 sm:text-base lg:mb-10 lg:text-lg">
                        Scan the unique session QR code from any secondary device to establish a secure, encrypted direct p2p handshake. 
                    </p>
                    
                    <ul className="space-y-4">
                        {[
                            "Instant peer discovery",
                            "Encrypted signaling",
                            "Auto-reconnect technology"
                        ].map((text, i) => (
                            <li key={i} className="flex items-center gap-3 text-xs font-medium text-black sm:text-sm">
                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="relative min-w-0">
                    <Card className="relative z-10 flex aspect-square w-full items-center justify-center overflow-hidden border-2 border-black bg-white p-6 shadow-2xl sm:p-12">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <QrCode className="h-40 w-40 sm:h-60 sm:w-60" strokeWidth={1} />
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                <div className="w-16 h-16 bg-white border-2 border-black rounded-sm flex items-center justify-center p-2">
                                    <Smartphone className="text-black" />
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Scanning effect */}
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-[2px] bg-black/20 shadow-[0_0_15px_black] z-20"
                        />
                    </Card>
                    
                    <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-100 animate-pulse -z-10 sm:h-[120%] sm:w-[120%]" />
                </div>
            </div>
        </section>
    );
};
