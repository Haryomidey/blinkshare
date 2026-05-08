import { useEffect, useMemo, useRef, useState } from 'react';
import { api, realtimeUrl } from '@/services/api.ts';
import type { ReceiveSession } from '@/types/transfer.ts';

export const useReceiveSession = (deviceName = 'This device') => {
    const [session, setSession] = useState<ReceiveSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasCreatedSessionRef = useRef(false);

    const createSession = async () => {
        hasCreatedSessionRef.current = true;
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
        if (hasCreatedSessionRef.current) return;
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

    useEffect(() => {
        if (!session || session.transferId) return;

        const intervalId = window.setInterval(async () => {
            const updatedSession = await api.getReceiveSession(session.code).catch(() => null);
            if (updatedSession?.code === session.code) {
                setSession(updatedSession);
            }
        }, 1500);

        return () => window.clearInterval(intervalId);
    }, [session?.code, session?.transferId]);

    return useMemo(
        () => ({ session, isLoading, error, refresh: createSession }),
        [error, isLoading, session]
    );
};
