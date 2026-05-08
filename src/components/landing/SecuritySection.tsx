import { ShieldCheck, Lock, EyeOff, ServerOff } from 'lucide-react';

export const SecuritySection = () => {
    return (
        <section className="py-32 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-8 border border-neutral-200 rounded-sm space-y-4">
                            <Lock className="w-8 h-8 text-black" />
                            <h3 className="font-bold text-black uppercase tracking-tight">E2E Encrypted</h3>
                        </div>
                        <div className="p-8 bg-black text-white rounded-sm space-y-4">
                            <ServerOff className="w-8 h-8 text-white" />
                            <h3 className="font-bold text-white uppercase tracking-tight text-neutral-400">No Servers</h3>
                        </div>
                        <div className="p-8 bg-neutral-50 border border-neutral-100 rounded-sm space-y-4">
                            <EyeOff className="w-8 h-8 text-neutral-400" />
                            <h3 className="font-bold text-black uppercase tracking-tight text-neutral-600">Zero Tracking</h3>
                        </div>
                        <div className="p-8 border border-black rounded-sm space-y-4">
                            <ShieldCheck className="w-8 h-8 text-black" />
                            <h3 className="font-bold text-black uppercase tracking-tight">Audit-ready</h3>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-neutral-400 mb-4">Security Protocol</p>
                        <h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:mb-8">
                            Total privacy by design, not by policy.
                        </h2>
                        <p className="mb-6 text-sm leading-relaxed text-neutral-500 sm:text-base lg:mb-8 lg:text-lg">
                            Unlike traditional cloud transfers, your data is never stored on our servers. Even the signaling server only facilitates the initial handshake—once connected, your files flow directly through a secure tunnel between your browsers.
                        </p>
                        <p className="text-sm font-medium text-black border-l-2 border-black pl-4 py-2">
                            "The most secure file is the one that never leaves your local network's encrypted peer connection."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
