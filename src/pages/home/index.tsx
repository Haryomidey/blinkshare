import React, { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { Hero } from '@/components/landing/Hero.tsx';
import { AnimatedTransferMockup } from '@/components/landing/AnimatedTransferMockup.tsx';
import { FeatureGrid } from '@/components/landing/FeatureGrid.tsx';
import { QRPairingSection } from '@/components/landing/QRPairingSection.tsx';
import { SecuritySection } from '@/components/landing/SecuritySection.tsx';
import { CTASection } from '@/components/landing/CTASection.tsx';
import { motion, AnimatePresence } from 'motion/react';

export default function Landing() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-w-0 overflow-x-hidden bg-white selection:bg-black selection:text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 flex h-20 min-w-0 items-center justify-between gap-4 border-b border-neutral-100 bg-white/80 px-4 backdrop-blur-md md:px-8">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                        <Zap size={16} className="text-white bg-black" fill="white" />
                    </div>
                    <span className="min-w-0 truncate text-lg font-bold tracking-tight sm:text-xl">BlinkShare</span>
                </div>
                
                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-xs font-bold uppercase tracking-widest hover:text-neutral-500 transition-colors">Features</a>
                    <a href="#security" className="text-xs font-bold uppercase tracking-widest hover:text-neutral-500 transition-colors">Security</a>
                    <a href="/app" className="text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-2.5 rounded-sm hover:scale-105 transition-all">Launch Dashboard</a>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden p-2 text-black cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[49] flex min-w-0 flex-col items-center justify-center gap-8 overflow-y-auto bg-white p-8 md:hidden"
                    >
                        <a 
                            href="#features" 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold uppercase tracking-tight text-black transition-colors hover:text-neutral-500 sm:text-2xl"
                        >
                            Features
                        </a>
                        <a 
                            href="#security" 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-bold uppercase tracking-tight text-black transition-colors hover:text-neutral-500 sm:text-2xl"
                        >
                            Security
                        </a>
                        <a 
                            href="/app" 
                            className="w-full rounded-sm bg-black px-8 py-4 text-center text-lg font-bold uppercase tracking-tight text-white sm:px-10 sm:py-5 sm:text-2xl"
                        >
                            Launch Dashboard
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Hero />
            <AnimatedTransferMockup />
            <div id="features">
                <FeatureGrid />
            </div>
            <QRPairingSection />
            <div id="security">
                <SecuritySection />
            </div>
            <CTASection />
        </div>
    );
}
