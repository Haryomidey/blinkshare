import { History } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge.tsx';
import { TransferHistoryList } from '@/components/transfer/TransferHistoryList.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Link } from 'react-router-dom';
import { useRealtimeTransfers } from '@/hooks/useRealtimeTransfers.ts';
import { formatFileSize, formatSpeed } from '@/lib/formatters.ts';

export default function HistoryPage() {
    const { transfers, stats, isLoading, error } = useRealtimeTransfers();
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const hasTransfers = transfers.length > 0;
    const totalPages = Math.max(1, Math.ceil(transfers.length / pageSize));
    const visibleTransfers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return transfers.slice(start, start + pageSize);
    }, [page, transfers]);

    useEffect(() => {
        setPage((currentPage) => Math.min(currentPage, totalPages));
    }, [totalPages]);

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <Badge className="mb-4">History</Badge>
                <h1 className="text-4xl font-bold tracking-tighter text-black">Transfer History</h1>
                <p className="text-neutral-500 mt-2">A record of files sent and received on this device.</p>
            </header>

            {error && (
                <div className="rounded-sm border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    {error}. Make sure the backend is running on port 4000.
                </div>
            )}

            {isLoading ? (
                <div className="rounded-sm border border-neutral-100 p-8 text-sm text-neutral-500">Loading history...</div>
            ) : !hasTransfers ? (
                <EmptyState 
                    icon={History}
                    title="No transfers yet"
                    description="When you send or receive files, they will appear here."
                    action={
                        <Link to="/app/send">
                            <Button>Start First Transfer</Button>
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-12">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                        <div className="p-6 border border-neutral-100 rounded-sm sm:p-8">
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-300 mb-2">Total Shares</p>
                            <p className="text-3xl font-bold text-black font-mono">{stats.totalSent + stats.totalReceived}</p>
                        </div>
                        <div className="p-6 border border-neutral-100 rounded-sm sm:p-8">
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-300 mb-2">Volume</p>
                            <p className="text-3xl font-bold text-black font-mono">{formatFileSize(stats.totalTransferred)}</p>
                        </div>
                        <div className="p-6 border border-neutral-100 rounded-sm sm:p-8">
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-300 mb-2">Avg. Speed</p>
                            <p className="text-3xl font-bold text-black font-mono">{formatSpeed(stats.averageSpeed)}</p>
                        </div>
                    </div>

                    <TransferHistoryList transfers={visibleTransfers} />
                    
                    {totalPages > 1 && (
                        <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
                            <p className="text-xs text-neutral-500">
                                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, transfers.length)} of {transfers.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                                >
                                    Previous
                                </Button>
                                <span className="px-3 text-xs font-bold text-neutral-500">
                                    {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
