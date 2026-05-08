import { motion } from 'motion/react';
import { ArrowRight, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { Link } from 'react-router-dom';

export const Hero = () => {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden px-4">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[50vh] h-[50vh] bg-neutral-100 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-1/4 right-1/4 w-[40vh] h-[40vh] bg-neutral-100 rounded-full blur-[100px] opacity-40" />
            </div>

            <div className="relative z-10 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
                >
                    <Zap className="w-3 h-3 fill-black text-black" />
                    <span>Experimental P2P Direct Transfer</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-[12vw] md:text-[80px] font-bold tracking-tight leading-[0.9] text-black mb-8"
                >
                    NO CLOUDS.<br />
                    JUST DIRECT SPEED.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-neutral-500 max-w-xl mx-auto mb-12 leading-relaxed"
                >
                    Transfer massive files browser-to-browser instantly. No accounts, no uploads, no storage limits. Encrypted and completely peer-to-peer.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/app/send">
                        <Button size="lg" className="group">
                            Start Transfer
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/app/receive">
                        <Button variant="outline" size="lg">
                            <Download className="mr-2 w-5 h-5" />
                            Receive Files
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
