import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';

export const CTASection = () => {
    return (
        <section className="py-20 px-4 bg-white border-t border-neutral-100 sm:py-32">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-sm bg-black p-6 text-center sm:p-10 lg:p-16">
                {/* Background Patterns */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>
                
                <div className="relative z-10">
                    <Zap className="w-12 h-12 text-white mx-auto mb-8 animate-bounce" fill="white" />
                    <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-5xl sm:tracking-tighter md:text-6xl lg:mb-8">
                        READY TO SHARE?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-xs text-neutral-400 sm:text-base lg:mb-12 lg:text-xl">
                        Experience the direct browser-to-browser transfer technology. Start your session now.
                    </p>
                    <div className="flex flex-row flex-nowrap items-center justify-center gap-3 sm:gap-6">
                        <Link to="/app/send">
                            <Button size="lg" className="bg-white text-black hover:bg-neutral-200 px-3 py-2.5 text-xs sm:px-8 sm:py-4 sm:text-lg">
                                Send a File
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/app/receive">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-3 py-2.5 text-xs sm:px-8 sm:py-4 sm:text-lg">
                                Receive Files
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            
            <footer className="mt-24 text-center">
                <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-neutral-300 sm:text-[10px] sm:tracking-[0.5em]">
                    BlinkShare &copy; 2026 PREMIUM P2P TRANSFER
                </p>
            </footer>
        </section>
    );
};
