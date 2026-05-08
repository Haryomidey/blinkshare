import { useEffect, useMemo, useState } from 'react';
import { api, realtimeUrl } from '@/services/api.ts';
import type { Transfer } from '@/types/transfer.ts';

const mergeTransferUpdate = (current: Transfer | null, next: Transfer): Transfer => {
    if (!current || current.id !== next.id) return next;

    const hasNewFiles = next.files.length > current.files.length || next.size > current.size;
    const wasReopened = current.status === 'completed' && next.status !== 'completed';
    const nextBytesTransferred = next.bytesTransferred ?? 0;
    const nextIsPartial = next.size > 0 && nextBytesTransferred < next.size;
    const shouldTrustNextProgress = hasNewFiles || wasReopened || nextIsPartial;
    const currentFiles = new Map(current.files.map((file) => [file.id, file]));
    const files = next.files.map((file) => {
        const previous = currentFiles.get(file.id);
        if (!previous) return file;

        const progress = Math.max(previous.progress, file.progress);
        return {
            ...file,
            progress,
            status: previous.status === 'completed' || progress >= 100 ? 'completed' : file.status,
        };
    });
    const bytesTransferred = shouldTrustNextProgress
        ? next.bytesTransferred ?? 0
        : Math.max(current.bytesTransferred ?? 0, next.bytesTransferred ?? 0);
    const progress = shouldTrustNextProgress
        ? Math.min(100, (bytesTransferred / Math.max(next.size, 1)) * 100)
        : Math.max(current.progress, next.progress);
    const status = nextIsPartial && next.status === 'completed' ? 'transferring' : next.status;

    return {
        ...next,
        files,
        bytesTransferred,
        progress,
        status: shouldTrustNextProgress
            ? status
            : current.status === 'completed' || progress >= 100 ? 'completed' : next.status,
    };
};

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

        const socket = new WebSocket(realtimeUrl);

        socket.onmessage = (message) => {
            const event = JSON.parse(message.data);
            if (event.type === 'transfer:updated' && event.payload.id === id) {
                setTransfer((current) => mergeTransferUpdate(current, event.payload));
            }
        };

        return () => {
            isMounted = false;
            socket.close();
        };
    }, [id]);

    return useMemo(() => ({ transfer, isLoading, error }), [error, isLoading, transfer]);
};
