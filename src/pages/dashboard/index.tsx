import { Send, Download, History, Zap, Shield, ArrowRight, Share2, Activity, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { mockTransfers, mockStats } from '@/data/mockTransfers.ts';
import { TransferHistoryList } from '@/components/transfer/TransferHistoryList.tsx';
import { formatFileSize, formatSpeed } from '@/lib/formatters.ts';
import { motion } from 'motion/react';

export default function Dashboard() {
    return (
        <div className="space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Ecosystem Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-bold tracking-tight text-neutral-900 mb-2">Live Node</h1>
                    <p className="text-lg text-neutral-500 font-light max-w-xl">
                        Your direct gateway to the local peer mesh. Status: <span className="text-black font-bold uppercase text-xs tracking-widest bg-neutral-100 px-2 py-0.5 rounded-sm">Operational</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Card className="px-4 py-2 bg-neutral-50 border-neutral-100 flex items-center gap-3">
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 italic">No Latency detected</span>
                    </Card>
                </div>
            </header>

            {/* Quick Handshakes */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="p-12 bg-neutral-900 rounded-sm border border-black relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12">
                            <Zap size={240} fill="white" className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors cursor-default">P2P Active</Badge>
                            <h2 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">Forge a new<br />handshake.</h2>
                            <p className="text-xl text-neutral-400 max-w-md mb-12 leading-relaxed font-light">
                                Skip the cloud entirely. Transfer at the physical limits of your network.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/app/send">
                                    <Button size="lg" className="bg-white text-black hover:bg-neutral-200 px-8 py-7 text-lg rounded-sm transition-all hover:-translate-y-1">
                                        Initiate Send
                                        <ArrowRight className="ml-3 w-6 h-6" />
                                    </Button>
                                </Link>
                                <Link to="/app/receive">
                                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-7 text-lg rounded-sm transition-all">
                                        Await Data
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card className="p-10 flex flex-col items-start justify-between bg-white border-neutral-100 shadow-sm hover:shadow-md transition-all">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-neutral-900 rounded-full">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Security Core</span>
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-black mb-4">Zero-Footprint</h3>
                            <p className="text-base text-neutral-500 leading-relaxed font-light italic">
                                "Your data is a conversation between two peers, and we aren't listening."
                            </p>
                        </div>
                        <Link to="/app/settings" className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex items-center gap-2 hover:text-black hover:translate-x-1 transition-all group">
                            Protocol Settings <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Card>
                </div>
            </div>

            {/* Ecosystem Vitals */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Cpu className="w-5 h-5 text-neutral-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Ecosystem Vitals</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Shares Sent', value: mockStats.totalSent, icon: Send },
                        { label: 'Shares Received', value: mockStats.totalReceived, icon: Download },
                        { label: 'Total Volume', value: formatFileSize(mockStats.totalTransferred), icon: Share2 },
                        { label: 'Pulse Speed', value: formatSpeed(mockStats.averageSpeed), icon: Zap },
                    ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <Card className="p-8 border-neutral-100 hover:border-black transition-colors group">
                            <div className="flex flex-col gap-6">
                                <div className="w-10 h-10 rounded-sm bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-black group-hover:border-black transition-colors">
                                    <stat.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">{stat.label}</p>
                                    <p className="text-3xl font-bold tracking-tighter text-black font-mono leading-none">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                    ))}
                </div>
            </div>

            {/* Live Pulse */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
                    <div className="flex items-center gap-4">
                        <History className="w-5 h-5 text-neutral-400" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Live Pulse</h3>
                    </div>
                    <Link to="/app/history">
                        <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-black">
                            Expansion →
                        </Button>
                    </Link>
                </div>
                <TransferHistoryList transfers={mockTransfers.slice(0, 3)} />
            </div>
        </div>
    );
}
