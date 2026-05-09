import { motion } from 'motion/react';
import { ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { Link } from 'react-router-dom';

export const Hero = () => {
    return (
        <section className="relative flex min-h-[90vh] min-w-0 flex-col items-center justify-center overflow-hidden px-4 pb-12 pt-24">
            <div className="absolute inset-0 z-0">
                <div className="absolute left-1/4 top-1/4 h-[50vh] max-h-[32rem] w-[50vh] max-w-[32rem] rounded-full bg-neutral-100 opacity-60 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 h-[40vh] max-h-[28rem] w-[40vh] max-w-[28rem] rounded-full bg-neutral-100 opacity-40 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl min-w-0 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-5 text-5xl font-bold leading-none tracking-tight text-black sm:mb-7 sm:text-[10vw] md:text-[54px] lg:text-[62px]"
                >
                    NO CLOUDS.<br />
                    JUST DIRECT SPEED.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mx-auto mb-8 max-w-lg text-xs leading-relaxed text-neutral-500 sm:text-sm md:mb-10 md:text-base"
                >
                    Transfer massive files browser-to-browser instantly. No accounts, no uploads, no storage limits. Encrypted and completely peer-to-peer.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
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
