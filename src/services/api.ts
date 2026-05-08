import type { ReceiveSession, Transfer, TransferStats } from '@/types/transfer.ts';
import { getClientDeviceId } from '@/lib/deviceIdentity.ts';

const API_URL = import.meta.env.VITE_API_URL ?? '';

const getRealtimeUrl = () => {
    if (import.meta.env.VITE_REALTIME_URL) {
        return import.meta.env.VITE_REALTIME_URL;
    }

    if (API_URL) {
        return `${API_URL.replace(/^http/, 'ws')}/realtime`;
    }

    if (import.meta.env.DEV) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const backendHost = `${window.location.hostname || '127.0.0.1'}:4000`;
        return `${protocol}//${backendHost}/realtime`;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/realtime`;
};

const withOwner = (path: string) => {
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}ownerId=${encodeURIComponent(getClientDeviceId())}`;
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
    listTransfers: () => request<Transfer[]>(withOwner('/api/transfers')),
    clearTransfers: () => fetch(`${API_URL}${withOwner('/api/transfers')}`, { method: 'DELETE' }).then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    }),
    getTransfer: (id: string) => request<Transfer>(`/api/transfers/${id}`),
    getStats: () => request<TransferStats>(withOwner('/api/transfers/stats')),
    createTransfer: (payload: {
        files: Array<{ name: string; size: number }>;
        pairingCode?: string;
        receiver?: string;
    }) => request<Transfer>('/api/transfers', {
        method: 'POST',
        body: JSON.stringify({ ...payload, ownerId: getClientDeviceId() }),
    }),
    startTransfer: (id: string) => request<Transfer>(`/api/transfers/${id}/start`, { method: 'POST' }),
    updateTransferProgress: (id: string, payload: {
        bytesTransferred: number;
        progress: number;
        speed?: number;
        status?: Transfer['status'];
        files?: Array<{ id: string; progress: number; status: 'waiting' | 'transferring' | 'completed' | 'failed' }>;
    }) => request<Transfer>(`/api/transfers/${id}/progress`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    }),
    addTransferFiles: (id: string, files: File[]) => request<{ transfer: Transfer; files: Transfer['files'] }>(`/api/transfers/${id}/files`, {
        method: 'POST',
        body: JSON.stringify({
            ownerId: getClientDeviceId(),
            files: files.map((file) => ({ name: file.name, size: file.size })),
        }),
    }),
    removeTransferFile: (id: string, fileId: string) => request<Transfer>(`/api/transfers/${id}/files/${fileId}`, {
        method: 'DELETE',
        body: JSON.stringify({ ownerId: getClientDeviceId() }),
    }),
    cancelTransfer: (id: string) => request<Transfer>(`/api/transfers/${id}/cancel`, { method: 'POST' }),
    createReceiveSession: (deviceName: string) => request<ReceiveSession>('/api/receive-sessions', {
        method: 'POST',
        body: JSON.stringify({ deviceName, ownerId: getClientDeviceId() }),
    }),
    getReceiveSession: (code: string) => request<ReceiveSession>(`/api/receive-sessions/${code}`),
    pairReceiveSession: (code: string) => request<ReceiveSession>(`/api/receive-sessions/${code}/pair`, {
        method: 'POST',
    }),
};
