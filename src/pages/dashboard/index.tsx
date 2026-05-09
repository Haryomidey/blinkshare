import { Send, Download, History, Zap, Shield, ArrowRight, Share2, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { TransferHistoryList } from '@/components/transfer/TransferHistoryList.tsx';
import { formatFileSize, formatSpeed } from '@/lib/formatters.ts';
import { motion } from 'motion/react';
import { useRealtimeTransfers } from '@/hooks/useRealtimeTransfers.ts';

export default function Dashboard() {
    const { transfers, stats, isLoading, error } = useRealtimeTransfers();

    return (
        <div className="min-w-0 space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:space-y-12">
            {/* Dashboard Header */}
            <header className="flex min-w-0 flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="min-w-0">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">Dashboard</h1>
                    <p className="max-w-xl text-sm font-light text-neutral-500 sm:text-base lg:text-lg">
                        Send or receive files from nearby devices. Everything is ready when you are.
                    </p>
                </div>
            </header>

            {/* Quick Actions */}
            <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:gap-8">
                <div className="min-w-0 lg:col-span-2">
                    <div className="group relative min-w-0 overflow-hidden rounded-sm border border-black bg-neutral-900 p-6 shadow-2xl sm:p-10 lg:p-12">
                        <div className="pointer-events-none absolute right-0 top-0 p-8 opacity-10 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12 sm:p-16">
                            <Zap size={180} fill="white" className="text-white sm:size-[240px]" />
                        </div>
                        <div className="relative z-10 min-w-0">
                            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors cursor-default">Direct transfer</Badge>
                            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:mb-6 sm:text-4xl lg:text-5xl leading-tight">Start a new<br />file transfer.</h2>
                            <p className="mb-8 max-w-md text-sm font-light leading-relaxed text-neutral-400 sm:text-base lg:mb-12 lg:text-xl">
                                Pick files, pair with another device, and move them without uploading to cloud storage.
                            </p>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                <Link to="/app/send" className="min-w-0">
                                    <Button size="lg" className="bg-white text-black hover:bg-neutral-200 px-4 py-4 text-sm sm:px-8 sm:py-7 sm:text-lg rounded-sm transition-all hover:-translate-y-1">
                                        Send Files
                                        <ArrowRight className="ml-2 w-5 h-5 sm:ml-3 sm:w-6 sm:h-6" />
                                    </Button>
                                </Link>
                                <Link to="/app/receive" className="min-w-0">
                                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-4 py-4 text-sm sm:px-8 sm:py-7 sm:text-lg rounded-sm transition-all">
                                        Receive Files
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="min-w-0 space-y-8">
                    <Card className="flex flex-col items-start justify-between border-neutral-100 bg-white p-6 shadow-sm transition-all hover:shadow-md sm:p-8 lg:p-10">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-neutral-900 rounded-full">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Privacy</span>
                            </div>
                            <h3 className="mb-3 text-xl font-bold tracking-tight text-black sm:mb-4 sm:text-2xl">Files stay between devices</h3>
                            <p className="text-sm font-light leading-relaxed text-neutral-500 sm:text-base">
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
            <div className="min-w-0 space-y-8">
                <div className="flex min-w-0 items-center gap-4">
                    <Cpu className="w-5 h-5 text-neutral-400" />
                    <h3 className="min-w-0 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 sm:tracking-[0.4em]">Transfer Stats</h3>
                </div>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    {[
                        { label: 'Shares Sent', value: stats.totalSent, icon: Send },
                        { label: 'Shares Received', value: stats.totalReceived, icon: Download },
                        { label: 'Total Volume', value: formatFileSize(stats.totalTransferred), icon: Share2 },
                        { label: 'Average Speed', value: formatSpeed(stats.averageSpeed), icon: Zap },
                    ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <Card className="min-w-0 p-6 border-neutral-100 hover:border-black transition-colors group sm:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="w-10 h-10 rounded-sm bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-black group-hover:border-black transition-colors">
                                    <stat.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">{stat.label}</p>
                                    <p className="min-w-0 truncate font-mono text-2xl font-bold leading-none tracking-tighter text-black sm:text-3xl">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                    ))}
                </div>
            </div>

            {error && (
                <Card className="p-4 border-red-100 bg-red-50 text-sm text-red-700">
                    {error}. Make sure the backend is running on port 4000.
                </Card>
            )}

            {/* Recent Activity */}
            <div className="min-w-0 space-y-8">
                <div className="flex min-w-0 items-center justify-between gap-3 border-b border-neutral-100 pb-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <History className="w-5 h-5 text-neutral-400" />
                        <h3 className="min-w-0 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 sm:tracking-[0.4em]">Recent Activity</h3>
                    </div>
                    <Link to="/app/history">
                        <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-black">
                            View all
                        </Button>
                    </Link>
                </div>
                {isLoading ? (
                    <Card className="p-8 text-sm text-neutral-500">Loading transfers...</Card>
                ) : (
                    <TransferHistoryList transfers={transfers.slice(0, 3)} />
                )}
            </div>
        </div>
    );
}
