import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';

export const CTASection = () => {
    return (
        <section className="py-32 px-4 bg-white border-t border-neutral-100">
            <div className="max-w-4xl mx-auto p-16 bg-black rounded-sm text-center relative overflow-hidden">
                {/* Background Patterns */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>
                
                <div className="relative z-10">
                    <Zap className="w-12 h-12 text-white mx-auto mb-8 animate-bounce" fill="white" />
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-8">
                        READY TO SHARE?
                    </h2>
                    <p className="text-xl text-neutral-400 max-w-xl mx-auto mb-12">
                        Experience the direct browser-to-browser transfer technology. Start your session now.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/app/send">
                            <Button size="lg" className="bg-white text-black hover:bg-neutral-200">
                                Send a File
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/app/receive">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                Receive Files
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            
            <footer className="mt-24 text-center">
                <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-neutral-300">
                    BlinkShare &copy; 2026 PREMIUM P2P TRANSFER
                </p>
            </footer>
        </section>
    );
};
