import { useEffect, useMemo, useState } from 'react';
import { api, realtimeUrl } from '@/services/api.ts';
import type { Transfer, TransferStats } from '@/types/transfer.ts';
import { getClientDeviceId } from '@/lib/deviceIdentity.ts';

const emptyStats: TransferStats = {
    totalSent: 0,
    totalReceived: 0,
    totalTransferred: 0,
    averageSpeed: 0,
};

const transferForOwner = (transfer: Transfer, ownerId: string): Transfer => ({
    ...transfer,
    type: transfer.receiverOwnerId === ownerId ? 'received' : 'sent',
});

export const useRealtimeTransfers = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [stats, setStats] = useState<TransferStats>(emptyStats);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const ownerId = getClientDeviceId();

        const load = async () => {
            try {
                const [transferList, transferStats] = await Promise.all([
                    api.listTransfers(),
                    api.getStats(),
                ]);

                if (!isMounted) return;
                setTransfers(transferList);
                setStats(transferStats);
                setError(null);
            } catch (requestError) {
                if (!isMounted) return;
                setError(requestError instanceof Error ? requestError.message : 'Unable to load transfers');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void load();

        const socket = new WebSocket(realtimeUrl);

        socket.onmessage = (message) => {
            const event = JSON.parse(message.data);

            if (event.type === 'transfer:list' && event.ownerId === ownerId) {
                setTransfers(event.payload);
            }

            if (event.type === 'transfer:updated' && event.payload.ownerIds?.includes(ownerId)) {
                setTransfers((current) => {
                    const nextTransfer = transferForOwner(event.payload, ownerId);
                    const next = current.filter((transfer) => transfer.id !== nextTransfer.id);
                    return [nextTransfer, ...next].sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                });
            }

            if (event.type === 'stats:updated' && event.ownerId === ownerId) {
                setStats(event.payload);
            }
        };

        socket.onerror = () => setError('Realtime connection is unavailable');

        return () => {
            isMounted = false;
            socket.close();
        };
    }, []);

    return useMemo(() => ({ transfers, stats, isLoading, error }), [error, isLoading, stats, transfers]);
};
