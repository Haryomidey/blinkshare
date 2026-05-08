import type { ReceiveSession, Transfer, TransferStats } from '@/types/transfer.ts';

const API_URL = import.meta.env.VITE_API_URL ?? '';

const getRealtimeUrl = () => {
    if (import.meta.env.VITE_REALTIME_URL) {
        return import.meta.env.VITE_REALTIME_URL;
    }

    if (API_URL) {
        return `${API_URL.replace(/^http/, 'ws')}/realtime`;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/realtime`;
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });

    if (!response.ok) {
        const fallback = `Request failed with status ${response.status}`;
        const body = await response.json().catch(() => ({ message: fallback }));
        throw new Error(body.message ?? fallback);
    }

    return response.json() as Promise<T>;
};

export const realtimeUrl = getRealtimeUrl();

export const api = {
    listTransfers: () => request<Transfer[]>('/api/transfers'),
    getTransfer: (id: string) => request<Transfer>(`/api/transfers/${id}`),
    getStats: () => request<TransferStats>('/api/transfers/stats'),
    createTransfer: (payload: {
        files: Array<{ name: string; size: number }>;
        pairingCode?: string;
        receiver?: string;
    }) => request<Transfer>('/api/transfers', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    startTransfer: (id: string) => request<Transfer>(`/api/transfers/${id}/start`, { method: 'POST' }),
    cancelTransfer: (id: string) => request<Transfer>(`/api/transfers/${id}/cancel`, { method: 'POST' }),
    createReceiveSession: (deviceName: string) => request<ReceiveSession>('/api/receive-sessions', {
        method: 'POST',
        body: JSON.stringify({ deviceName }),
    }),
    getReceiveSession: (code: string) => request<ReceiveSession>(`/api/receive-sessions/${code}`),
};
