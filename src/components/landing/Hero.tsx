import { motion } from 'motion/react';
import { ArrowRight, Download } from 'lucide-react';
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
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-5 text-[12vw] font-bold leading-[1] tracking-tight text-black sm:mb-7 sm:text-[10vw] md:text-[64px] lg:text-[72px]"
                >
                    NO CLOUDS.<br />
                    JUST DIRECT SPEED.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mx-auto mb-8 max-w-lg text-xs leading-relaxed text-neutral-500 sm:text-sm md:mb-10 md:text-base lg:text-lg"
                >
                    Transfer massive files browser-to-browser instantly. No accounts, no uploads, no storage limits. Encrypted and completely peer-to-peer.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-row flex-nowrap items-center justify-center gap-3 sm:gap-4"
                >
                    <Link to="/app/send">
                        <Button size="lg" className="group px-3 py-2.5 text-xs sm:px-8 sm:py-4 sm:text-lg">
                            Start Transfer
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/app/receive">
                        <Button variant="outline" size="lg" className="px-3 py-2.5 text-xs sm:px-8 sm:py-4 sm:text-lg">
                            <Download className="mr-2 w-5 h-5" />
                            Receive Files
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
