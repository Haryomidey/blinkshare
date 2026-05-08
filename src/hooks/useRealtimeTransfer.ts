import { useEffect, useMemo, useState } from 'react';
import { api, realtimeUrl } from '@/services/api.ts';
import type { Transfer } from '@/types/transfer.ts';

export const useRealtimeTransfer = (id?: string) => {
    const [transfer, setTransfer] = useState<Transfer | null>(null);
    const [isLoading, setIsLoading] = useState(Boolean(id));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        let isMounted = true;

        const load = async () => {
            try {
                setTransfer(await api.getTransfer(id));
                setError(null);
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : 'Unable to load transfer');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void load();
        void api.startTransfer(id).catch(() => undefined);

        const socket = new WebSocket(realtimeUrl);

        socket.onmessage = (message) => {
            const event = JSON.parse(message.data);
            if (event.type === 'transfer:updated' && event.payload.id === id) {
                setTransfer(event.payload);
            }
        };

        return () => {
            isMounted = false;
            socket.close();
        };
    }, [id]);

    return useMemo(() => ({ transfer, isLoading, error }), [error, isLoading, transfer]);
};
