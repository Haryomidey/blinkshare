import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, ChevronDown, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { formatFileSize, formatDate } from '@/lib/formatters.ts';
import { cn } from '@/lib/utils.ts';

type TransferFilter = 'all' | 'sent' | 'received' | 'completed' | 'failed';

const filterOptions: Array<{ label: string; value: TransferFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Sent', value: 'sent' },
    { label: 'Received', value: 'received' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
];

interface TransferHistoryListProps {
    transfers: any[];
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
            const searchableText = [
                tx.id,
                tx.name,
                tx.status,
                tx.type,
                deviceName,
                formatFileSize(tx.size),
                formatDate(tx.date),
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
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-neutral-100">
                <h2 className="text-xl font-bold tracking-tight text-black">Recent Transfers</h2>
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
                    <div ref={filterMenuRef} className="relative w-full sm:w-40 sm:shrink-0">
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
                            <Card hover className="p-4 group overflow-hidden">
                                <div className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-4 sm:items-center">
                                    <div className={cn(
                                        "w-12 h-12 rounded-sm border border-neutral-100 flex shrink-0 items-center justify-center transition-colors group-hover:bg-black group-hover:border-black",
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
                                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                    <p className="max-w-full truncate text-sm font-bold text-black sm:max-w-[260px]">{tx.name}</p>
                                                    <Badge variant={tx.status === 'completed' ? 'success' : 'error'}>
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-neutral-500">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        {formatFileSize(tx.size)}
                                                    </span>
                                                    <span>{tx.type === 'sent' ? `To ${tx.receiver}` : `From ${tx.sender}`}</span>
                                                    <span>{formatDate(tx.date)}</span>
                                                </div>
                                            </div>
                                            <p className="shrink-0 text-[10px] font-mono text-neutral-400 uppercase sm:text-right">{tx.id}</p>
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
