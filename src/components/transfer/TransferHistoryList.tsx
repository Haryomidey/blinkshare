import { Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { formatFileSize, formatDate } from '@/lib/formatters.ts';
import { cn } from '@/lib/utils.ts';

interface TransferHistoryListProps {
    transfers: any[];
}

export const TransferHistoryList = ({ transfers }: TransferHistoryListProps) => {
    if (transfers.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-neutral-100">
                <h2 className="text-xl font-bold tracking-tight text-black">Recent Transfers</h2>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 h-9 px-3 rounded-sm">
                        <Search className="w-4 h-4 text-neutral-400" />
                        <input className="bg-transparent border-none text-xs focus:ring-0 w-32 placeholder:text-neutral-400" placeholder="Filter..." />
                    </div>
                    <button className="flex items-center gap-2 px-3 h-9 bg-neutral-50 border border-neutral-200 rounded-sm hover:bg-neutral-100 transition-colors">
                        <Filter className="w-4 h-4 text-neutral-500" />
                        <span className="text-xs font-medium">Filter</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-2">
                {transfers.map((tx) => (
                    <div key={tx.id}>
                        <Card hover className="p-4 group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-sm border border-neutral-100 flex items-center justify-center transition-colors group-hover:bg-black group-hover:border-black",
                                    tx.status === 'completed' ? "bg-neutral-50" : "bg-neutral-50"
                                )}>
                                    {tx.type === 'sent' ? (
                                        <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                                    ) : (
                                        <ArrowDownLeft className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <p className="text-sm font-bold text-black truncate">{tx.name}</p>
                                            <Badge variant={tx.status === 'completed' ? 'success' : 'error'}>
                                                {tx.status}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] font-mono text-neutral-400 uppercase">{tx.id}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {formatFileSize(tx.size)}
                                        </span>
                                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                                        <span>{tx.type === 'sent' ? `To: ${tx.receiver}` : `From: ${tx.sender}`}</span>
                                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                                        <span>{formatDate(tx.date)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};
