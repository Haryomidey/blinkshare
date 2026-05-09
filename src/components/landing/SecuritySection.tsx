import { ShieldCheck, Lock, EyeOff, ServerOff } from 'lucide-react';

export const SecuritySection = () => {
    return (
        <section className="min-w-0 overflow-hidden bg-white px-4 py-20 sm:py-32">
            <div className="mx-auto max-w-6xl min-w-0">
                <div className="grid min-w-0 items-center gap-10 md:grid-cols-2 md:gap-16">
                    <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-4 rounded-sm border border-neutral-200 p-4 sm:p-8">
                            <Lock className="w-8 h-8 text-black" />
                            <h3 className="text-xs font-bold uppercase tracking-tight text-black sm:text-base">E2E Encrypted</h3>
                        </div>
                        <div className="space-y-4 rounded-sm bg-black p-4 text-white sm:p-8">
                            <ServerOff className="w-8 h-8 text-white" />
                            <h3 className="text-xs font-bold uppercase tracking-tight text-neutral-400 sm:text-base">No Servers</h3>
                        </div>
                        <div className="space-y-4 rounded-sm border border-neutral-100 bg-neutral-50 p-4 sm:p-8">
                            <EyeOff className="w-8 h-8 text-neutral-400" />
                            <h3 className="text-xs font-bold uppercase tracking-tight text-neutral-600 sm:text-base">Zero Tracking</h3>
                        </div>
                        <div className="space-y-4 rounded-sm border border-black p-4 sm:p-8">
                            <ShieldCheck className="w-8 h-8 text-black" />
                            <h3 className="text-xs font-bold uppercase tracking-tight text-black sm:text-base">Audit-ready</h3>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-neutral-400 mb-4">Security Protocol</p>
                        <h2 className="mb-4 text-2xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:mb-8">
                            Total privacy by design, not by policy.
                        </h2>
                        <p className="mb-6 text-xs leading-relaxed text-neutral-500 sm:text-base lg:mb-8 lg:text-lg">
                            Unlike traditional cloud transfers, your data is never stored on our servers. Even the signaling server only facilitates the initial handshake—once connected, your files flow directly through a secure tunnel between your browsers.
                        </p>
                        <p className="border-l-2 border-black py-2 pl-4 text-xs font-medium text-black sm:text-sm">
                            "The most secure file is the one that never leaves your local network's encrypted peer connection."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
