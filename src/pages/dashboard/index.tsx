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
            {/* Dashboard Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-bold tracking-tight text-neutral-900 mb-2">Dashboard</h1>
                    <p className="text-lg text-neutral-500 font-light max-w-xl">
                        Send or receive files from nearby devices. Everything is ready when you are.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Card className="px-4 py-2 bg-neutral-50 border-neutral-100 flex items-center gap-3">
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Ready to transfer</span>
                    </Card>
                </div>
            </header>

            {/* Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="p-12 bg-neutral-900 rounded-sm border border-black relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12">
                            <Zap size={240} fill="white" className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors cursor-default">Direct transfer</Badge>
                            <h2 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">Start a new<br />file transfer.</h2>
                            <p className="text-xl text-neutral-400 max-w-md mb-12 leading-relaxed font-light">
                                Pick files, pair with another device, and move them without uploading to cloud storage.
                            </p>
                            <div className="flex flex-nowrap gap-3 sm:gap-4">
                                <Link to="/app/send">
                                    <Button size="lg" className="bg-white text-black hover:bg-neutral-200 px-4 py-4 text-sm sm:px-8 sm:py-7 sm:text-lg rounded-sm transition-all hover:-translate-y-1">
                                        Send Files
                                        <ArrowRight className="ml-2 w-5 h-5 sm:ml-3 sm:w-6 sm:h-6" />
                                    </Button>
                                </Link>
                                <Link to="/app/receive">
                                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-4 py-4 text-sm sm:px-8 sm:py-7 sm:text-lg rounded-sm transition-all">
                                        Receive Files
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
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Privacy</span>
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-black mb-4">Files stay between devices</h3>
                            <p className="text-base text-neutral-500 leading-relaxed font-light">
                                BlinkShare helps devices connect directly, so your files are not stored on our servers.
                            </p>
                        </div>
                        <Link to="/app/settings" className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 flex items-center gap-2 hover:text-black hover:translate-x-1 transition-all group">
                            Review settings <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Card>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Cpu className="w-5 h-5 text-neutral-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Transfer Stats</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Shares Sent', value: mockStats.totalSent, icon: Send },
                        { label: 'Shares Received', value: mockStats.totalReceived, icon: Download },
                        { label: 'Total Volume', value: formatFileSize(mockStats.totalTransferred), icon: Share2 },
                        { label: 'Average Speed', value: formatSpeed(mockStats.averageSpeed), icon: Zap },
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

            {/* Recent Activity */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
                    <div className="flex items-center gap-4">
                        <History className="w-5 h-5 text-neutral-400" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Recent Activity</h3>
                    </div>
                    <Link to="/app/history">
                        <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-black">
                            View all
                        </Button>
                    </Link>
                </div>
                <TransferHistoryList transfers={mockTransfers.slice(0, 3)} />
            </div>
        </div>
    );
}
