import { History } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.tsx';
import { mockTransfers } from '@/data/mockTransfers.ts';
import { TransferHistoryList } from '@/components/transfer/TransferHistoryList.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
    const hasTransfers = mockTransfers.length > 0;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <Badge className="mb-4">History</Badge>
                <h1 className="text-4xl font-bold tracking-tighter text-black">Transfer History</h1>
                <p className="text-neutral-500 mt-2">A record of files sent and received on this device.</p>
            </header>

            {!hasTransfers ? (
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
                            <p className="text-3xl font-bold text-black font-mono">231</p>
                        </div>
                        <div className="p-6 border border-neutral-100 rounded-sm sm:p-8">
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-300 mb-2">Uptime</p>
                            <p className="text-3xl font-bold text-black font-mono">14d</p>
                        </div>
                        <div className="p-6 border border-neutral-100 rounded-sm sm:p-8">
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-300 mb-2">Success Rate</p>
                            <p className="text-3xl font-bold text-black font-mono">99.2%</p>
                        </div>
                    </div>

                    <TransferHistoryList transfers={mockTransfers} />
                    
                    <div className="flex justify-center pt-8">
                        <Button variant="outline" size="sm">
                            Load More
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
