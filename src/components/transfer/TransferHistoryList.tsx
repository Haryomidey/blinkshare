import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, ChevronDown, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { formatFileSize, formatDate } from '@/lib/formatters.ts';
import { cn } from '@/lib/utils.ts';
import type { Transfer } from '@/types/transfer.ts';

type TransferFilter = 'all' | 'sent' | 'received' | 'completed' | 'failed';

const filterOptions: Array<{ label: string; value: TransferFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Sent', value: 'sent' },
    { label: 'Received', value: 'received' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
];

interface TransferHistoryListProps {
    transfers: Transfer[];
}

export const TransferHistoryList = ({ transfers }: TransferHistoryListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<TransferFilter>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const activeFilter = filterOptions.find((option) => option.value === filter) ?? filterOptions[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!filterMenuRef.current?.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTransfers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return transfers.filter((tx) => {
            const deviceName = tx.type === 'sent' ? tx.receiver : tx.sender;
            const transferDate = tx.createdAt;
            const searchableText = [
                tx.id,
                tx.name,
                tx.status,
                tx.type,
                deviceName,
                formatFileSize(tx.size),
                formatDate(transferDate),
            ].join(' ').toLowerCase();

            const matchesSearch = query.length === 0 || searchableText.includes(query);
            const matchesFilter =
                filter === 'all' ||
                tx.type === filter ||
                tx.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [filter, searchTerm, transfers]);

    if (transfers.length === 0) return null;

    return (
        <div className="min-w-0 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-neutral-100">
                <h2 className="min-w-0 text-lg font-bold tracking-tight text-black sm:text-xl">Recent Transfers</h2>
                <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                    <div className="flex min-w-0 flex-1 items-center gap-2 bg-neutral-50 border border-neutral-200 h-10 px-3 rounded-sm sm:h-9 sm:min-w-72 md:min-w-80 lg:min-w-96 py-3">
                        <Search className="w-4 h-4 text-neutral-400" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent border-none text-xs outline-none focus:ring-0 placeholder:text-neutral-400"
                            placeholder="Search..."
                        />
                    </div>
                    <div ref={filterMenuRef} className="relative w-full min-w-0 sm:w-40 sm:shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                            className="flex h-10 w-full items-center justify-between gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3 text-left transition-colors hover:bg-neutral-100 sm:h-9"
                            aria-expanded={isFilterOpen}
                            aria-haspopup="listbox"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <Filter className="w-4 h-4 shrink-0 text-neutral-500" />
                                <span className="truncate text-xs font-medium">{activeFilter.label}</span>
                            </span>
                            <ChevronDown className={cn('w-4 h-4 shrink-0 text-neutral-400 transition-transform', isFilterOpen && 'rotate-180')} />
                        </button>

                        {isFilterOpen && (
                            <div
                                role="listbox"
                                className="absolute right-0 top-11 z-30 w-full min-w-40 overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-xl sm:top-10"
                            >
                                {filterOptions.map((option) => {
                                    const isActive = option.value === filter;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="option"
                                            aria-selected={isActive}
                                            onClick={() => {
                                                setFilter(option.value);
                                                setIsFilterOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-xs font-medium transition-colors hover:bg-neutral-50',
                                                isActive ? 'text-black' : 'text-neutral-500'
                                            )}
                                        >
                                            <span>{option.label}</span>
                                            {isActive && <Check className="w-4 h-4" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {filteredTransfers.length === 0 ? (
                <div className="rounded-sm border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center">
                    <p className="text-sm font-bold text-black">No matching transfers</p>
                    <p className="mt-1 text-xs text-neutral-500">Try a different search or filter.</p>
                </div>
            ) : (
                <div className="grid gap-2">
                    {filteredTransfers.map((tx) => (
                        <div key={tx.id}>
                            <Card hover className="p-3 group overflow-hidden sm:p-4">
                                <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[48px_minmax(0,1fr)] sm:items-center sm:gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-sm border border-neutral-100 flex shrink-0 items-center justify-center transition-colors group-hover:bg-black group-hover:border-black sm:h-12 sm:w-12",
                                        tx.status === 'completed' ? "bg-neutral-50" : "bg-neutral-50"
                                    )}>
                                        {tx.type === 'sent' ? (
                                            <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                                        ) : (
                                            <ArrowDownLeft className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 space-y-2">
                                                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                                                    <p className="min-w-0 truncate text-sm font-bold text-black">{tx.name}</p>
                                                    <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'failed' || tx.status === 'cancelled' ? 'error' : 'outline'}>
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid min-w-0 gap-1 text-xs text-neutral-500 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
                                                    <span className="flex min-w-0 items-center gap-1">
                                                        <FileText className="h-3 w-3 shrink-0" />
                                                        {formatFileSize(tx.size)}
                                                    </span>
                                                    <span className="min-w-0 truncate">{tx.type === 'sent' ? `To ${tx.receiver}` : `From ${tx.sender}`}</span>
                                                    <span className="min-w-0 truncate">{formatDate(tx.createdAt)}</span>
                                                </div>
                                            </div>
                                            <p className="max-w-full truncate text-[10px] font-mono text-neutral-400 uppercase sm:shrink-0 sm:text-right">{tx.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
