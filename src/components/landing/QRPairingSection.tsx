import { motion } from 'motion/react';
import { Smartphone, QrCode, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';

export const QRPairingSection = () => {
    return (
        <section className="py-32 px-4 bg-neutral-50 border-y border-neutral-100">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-16">
                <div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-neutral-400 mb-4">Seamless Connection</p>
                    <h2 className="text-5xl font-bold tracking-tight text-black mb-8 leading-[1.1]">
                        Connect devices with a simple scan.
                    </h2>
                    <p className="text-lg text-neutral-500 mb-10 leading-relaxed max-w-md">
                        Scan the unique session QR code from any secondary device to establish a secure, encrypted direct p2p handshake. 
                    </p>
                    
                    <ul className="space-y-4">
                        {[
                            "Instant peer discovery",
                            "Encrypted signaling",
                            "Auto-reconnect technology"
                        ].map((text, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-medium text-black">
                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="relative">
                    <Card className="aspect-square bg-white border-2 border-black p-12 shadow-2xl flex items-center justify-center relative z-10 overflow-hidden">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <QrCode size={240} strokeWidth={1} />
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
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-neutral-100 rounded-full animate-pulse -z-10" />
                </div>
            </div>
        </section>
    );
};
