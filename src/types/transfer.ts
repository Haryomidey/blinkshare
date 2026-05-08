export type TransferStatus = 'waiting' | 'connecting' | 'transferring' | 'completed' | 'failed' | 'cancelled';
export type TransferType = 'sent' | 'received';
export type ReceiveSessionStatus = 'waiting' | 'paired' | 'expired';

export interface TransferFile {
    id: string;
    name: string;
    size: number;
    progress: number;
    status: 'waiting' | 'transferring' | 'completed' | 'failed';
}

export interface Transfer {
    id: string;
    name: string;
    size: number;
    status: TransferStatus;
    type: TransferType;
    sender?: string;
    receiver?: string;
    files: TransferFile[];
    progress: number;
    speed: number;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface TransferStats {
    totalSent: number;
    totalReceived: number;
    totalTransferred: number;
    averageSpeed: number;
}

export interface ReceiveSession {
    id: string;
    code: string;
    deviceName: string;
    status: ReceiveSessionStatus;
    transferId?: string;
    createdAt: string;
    updatedAt: string;
}
