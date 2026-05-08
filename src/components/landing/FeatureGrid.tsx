import { Shield, Zap, Globe, Lock, Share2, Infinity as InfiniteIcon } from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: "Blazing Fast Speeds",
        description: "Browser-to-browser WebRTC connection ensures you use your full network potential."
    },
    {
        icon: Lock,
        title: "End-to-End Encrypted",
        description: "Your files never touch any middle-man server. Only the sender and receiver have access."
    },
    {
        icon: InfiniteIcon,
        title: "No Size Limits",
        description: "Transfer 4K videos, massive game builds, or entire photo libraries without restrictions."
    },
    {
        icon: Globe,
        title: "Cross-Platform",
        description: "Works on anything with a modern browser. Mobile, Desktop, Tablet, OS-independent."
    },
    {
        icon: Share2,
        title: "Scan & Connect",
        description: "Scan a QR code from your phone and start transferring immediately from your desktop."
    },
    {
        icon: Shield,
        title: "Privacy First",
        description: "We don't store your files. We don't track your data. Just direct bits being moved."
    }
];

export const FeatureGrid = () => {
    return (
        <section className="py-20 bg-white px-4 border-b border-neutral-100 sm:py-24">
            <div className="max-w-6xl mx-auto">
                <div className="mb-14 text-center max-w-2xl mx-auto sm:mb-20">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-neutral-400 mb-4">Core Principles</p>
                    <h2 className="text-2xl font-bold tracking-tight text-black sm:text-4xl">Built for power users who value their data.</h2>
                </div>
                
                <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <div key={i} className="group">
                            <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                                <feature.icon className="text-white w-6 h-6" />
                            </div>
                            <h3 className="mb-2 text-sm font-bold text-black sm:mb-3 sm:text-lg">{feature.title}</h3>
                            <p className="text-xs leading-relaxed text-neutral-500 sm:text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
