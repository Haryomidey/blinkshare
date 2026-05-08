import { useEffect, useMemo, useState } from 'react';
import { api, realtimeUrl } from '@/services/api.ts';
import type { ReceiveSession } from '@/types/transfer.ts';

export const useReceiveSession = (deviceName = 'This device') => {
    const [session, setSession] = useState<ReceiveSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const createSession = async () => {
        setIsLoading(true);
        try {
            const nextSession = await api.createReceiveSession(deviceName);
            setSession(nextSession);
            setError(null);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to create receive session');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void createSession();
    }, [deviceName]);

    useEffect(() => {
        if (!session) return;

        const socket = new WebSocket(realtimeUrl);

        socket.onmessage = (message) => {
            const event = JSON.parse(message.data);
            if (event.type === 'receive-session:updated' && event.payload?.code === session.code) {
                setSession(event.payload);
            }
        };

        return () => socket.close();
    }, [session?.code]);

    return useMemo(
        () => ({ session, isLoading, error, refresh: createSession }),
        [error, isLoading, session]
    );
};
