import type { Transfer, TransferFile, TransferStats, TransferType } from '../types/transfer.js';
import type { TransferRepository } from '../repositories/TransferRepository.js';
import type { ReceiveSessionRepository } from '../repositories/ReceiveSessionRepository.js';
import type { RealtimeHub } from './RealtimeHub.js';
import { createId } from '../utils/ids.js';

export interface CreateTransferInput {
    files: Array<{ name: string; size: number }>;
    type?: TransferType;
    sender?: string;
    receiver?: string;
    pairingCode?: string;
    ownerId: string;
}

export class TransferService {
    private activeTimers = new Map<string, NodeJS.Timeout>();

    constructor(
        private readonly transfers: TransferRepository,
        private readonly receiveSessions: ReceiveSessionRepository,
        private readonly realtime: RealtimeHub
    ) {}

    list(ownerId?: string) {
        return this.transfers.list(ownerId);
    }

    findById(id: string) {
        return this.transfers.findById(id);
    }

    stats(ownerId?: string): Promise<TransferStats> {
        return this.transfers.stats(ownerId);
    }

    async clear(ownerId?: string) {
        const transfers = await this.transfers.list(ownerId);
        transfers.forEach((transfer) => {
            const timer = this.activeTimers.get(transfer.id);
            if (timer) clearInterval(timer);
            this.activeTimers.delete(transfer.id);
        });

        await this.transfers.clear(ownerId);
        this.realtime.broadcast({ type: 'transfer:list', ownerId, payload: await this.transfers.list(ownerId) });
        this.realtime.broadcast({ type: 'stats:updated', ownerId, payload: await this.transfers.stats(ownerId) });
    }

    async create(input: CreateTransferInput) {
        if (!input.pairingCode?.trim()) {
            throw new Error('Enter a receive code before starting a transfer.');
        }

        const now = new Date().toISOString();
        const files: TransferFile[] = input.files.map((file) => ({
            id: createId('FILE'),
            name: file.name,
            size: file.size,
            progress: 0,
            status: 'waiting',
        }));
        const pairedSession = input.pairingCode
            ? await this.receiveSessions.findByCode(input.pairingCode.toUpperCase())
            : null;

        if (!pairedSession) {
            throw new Error('That receive code was not found. Check the receiving device and try again.');
        }

        if (pairedSession.transferId || (pairedSession.status !== 'waiting' && pairedSession.status !== 'paired')) {
            throw new Error('That receive code is no longer available. Create a new receive session and try again.');
        }

        const transfer: Transfer = {
            id: createId('TX'),
            name: files.length === 1 ? files[0].name : `${files.length} files`,
            size: files.reduce((total, file) => total + file.size, 0),
            status: 'waiting',
            type: input.type ?? 'sent',
            sender: input.sender ?? 'This device',
            receiver: pairedSession.deviceName,
            ownerIds: [...new Set([input.ownerId, pairedSession.ownerId].filter(Boolean))],
            senderOwnerId: input.ownerId,
            receiverOwnerId: pairedSession.ownerId,
            files,
            progress: 0,
            bytesTransferred: 0,
            speed: 0,
            createdAt: now,
            updatedAt: now,
        };

        await this.transfers.create(transfer);

        if (pairedSession) {
            const updatedSession = await this.receiveSessions.update(pairedSession.code, {
                status: 'paired',
                transferId: transfer.id,
            });
            this.realtime.broadcast({ type: 'receive-session:updated', payload: updatedSession });
        }

        await this.broadcastState(transfer);
        return transfer;
    }

    async start(id: string) {
        const transfer = await this.transfers.findById(id);
        if (!transfer) return transfer;
        if (transfer.status === 'completed' || transfer.status === 'cancelled') return transfer;

        const started = await this.transfers.update(id, { status: 'transferring' });
        if (started) await this.broadcastState(started);
        return started;
    }

    async addFiles(id: string, input: AddTransferFilesInput) {
        const transfer = await this.transfers.findById(id);
        if (!transfer || !transfer.ownerIds.includes(input.ownerId)) return null;

        const files: TransferFile[] = input.files.map((file) => ({
            id: createId('FILE'),
            name: file.name,
            size: file.size,
            progress: 0,
            status: 'waiting',
        }));
        const size = transfer.size + files.reduce((total, file) => total + file.size, 0);
        const progress = Math.min(100, (transfer.bytesTransferred / Math.max(size, 1)) * 100);
        const updated = await this.transfers.update(id, {
            files: [...transfer.files, ...files],
            size,
            progress,
            status: 'transferring',
            completedAt: undefined,
        });

        if (updated) await this.broadcastState(updated);
        return updated ? { transfer: updated, files } : null;
    }

    async removeFile(id: string, fileId: string, input: RemoveTransferFileInput) {
        const transfer = await this.transfers.findById(id);
        if (!transfer || !transfer.ownerIds.includes(input.ownerId)) return null;
        if (!transfer.files.some((file) => file.id === fileId)) return null;

        const files = transfer.files.filter((file) => file.id !== fileId);
        const size = files.reduce((total, file) => total + file.size, 0);
        const bytesTransferred = Math.round(
            files.reduce((total, file) => total + (file.progress / 100) * file.size, 0)
        );
        const isCompleted = files.length > 0 && files.every((file) => file.progress >= 100 || file.status === 'completed');
        const progress = size > 0 ? Math.min(100, (bytesTransferred / size) * 100) : 0;
        const updated = await this.transfers.update(id, {
            files,
            name: files.length === 1 ? files[0].name : `${files.length} files`,
            size,
            bytesTransferred,
            progress,
            status: files.length === 0 ? 'cancelled' : isCompleted ? 'completed' : 'transferring',
            speed: files.length === 0 || isCompleted ? 0 : transfer.speed,
            completedAt: isCompleted ? new Date().toISOString() : undefined,
        });

        if (updated) await this.broadcastState(updated);
        return updated;
    }

    async updateProgress(id: string, input: UpdateTransferProgressInput) {
        const transfer = await this.transfers.findById(id);
        if (!transfer) return null;

        const files = input.files
            ? transfer.files.map((file) => {
                const patch = input.files?.find((item) => item.id === file.id);
                if (!patch) return file;

                const progress = Math.max(file.progress, patch.progress);
                return {
                    ...file,
                    progress,
                    status: file.status === 'completed' || progress >= 100 ? 'completed' : patch.status,
                };
            })
            : transfer.files;
        const completedBytes = Math.round(files.reduce((total, file) => total + (file.progress / 100) * file.size, 0));
        const bytesTransferred = Math.max(transfer.bytesTransferred, input.bytesTransferred, completedBytes);
        const progress = Math.min(100, (bytesTransferred / Math.max(transfer.size, 1)) * 100);
        const isCompleted = files.every((file) => file.status === 'completed' || file.progress >= 100);
        const updated = await this.transfers.update(id, {
            bytesTransferred,
            progress,
            speed: input.speed ?? transfer.speed,
            files,
            status: isCompleted ? 'completed' : input.status ?? transfer.status,
            completedAt: isCompleted ? new Date().toISOString() : transfer.completedAt,
        });

        if (updated) await this.broadcastState(updated);
        return updated;
    }

    async cancel(id: string) {
        const timer = this.activeTimers.get(id);
        if (timer) clearInterval(timer);
        this.activeTimers.delete(id);

        const transfer = await this.transfers.update(id, { status: 'cancelled', speed: 0 });
        if (transfer) await this.broadcastState(transfer);
        return transfer;
    }

    private async tick(id: string) {
        const transfer = await this.transfers.findById(id);
        if (!transfer || transfer.status !== 'transferring') return;

        const totalSize = Math.max(transfer.size, 1);
        const speed = Math.round(2_000_000 + Math.random() * 7_000_000);
        let remainingBytes = speed;
        const files = transfer.files.map((file) => {
            if (remainingBytes <= 0 || file.status === 'completed') return file;

            const fileCompletedBytes = (file.progress / 100) * file.size;
            const fileRemainingBytes = Math.max(file.size - fileCompletedBytes, 0);
            const appliedBytes = Math.min(fileRemainingBytes, remainingBytes);
            remainingBytes -= appliedBytes;

            const progress = Math.min(100, file.progress + (appliedBytes / Math.max(file.size, 1)) * 100);

            return {
                ...file,
                progress,
                status: progress >= 100 ? 'completed' as const : 'transferring' as const,
            };
        });

        const completedBytes = files.reduce((total, file) => total + (file.progress / 100) * file.size, 0);
        const progress = Math.min(100, (completedBytes / totalSize) * 100);
        const isCompleted = progress >= 100;
        const updated = await this.transfers.update(id, {
            files,
            progress,
            bytesTransferred: Math.round(completedBytes),
            speed,
            status: isCompleted ? 'completed' : 'transferring',
            completedAt: isCompleted ? new Date().toISOString() : transfer.completedAt,
        });

        if (isCompleted) {
            const timer = this.activeTimers.get(id);
            if (timer) clearInterval(timer);
            this.activeTimers.delete(id);
        }

        if (updated) await this.broadcastState(updated);
    }

    private async broadcastState(transfer: Transfer) {
        this.realtime.broadcast({ type: 'transfer:updated', payload: transfer });
        await Promise.all(transfer.ownerIds.map(async (ownerId) => {
            this.realtime.broadcast({ type: 'transfer:list', ownerId, payload: await this.transfers.list(ownerId) });
            this.realtime.broadcast({ type: 'stats:updated', ownerId, payload: await this.transfers.stats(ownerId) });
        }));
    }
}

export interface UpdateTransferProgressInput {
    bytesTransferred: number;
    progress: number;
    speed?: number;
    files?: Array<{ id: string; progress: number; status: TransferFile['status'] }>;
    status?: Transfer['status'];
}

export interface AddTransferFilesInput {
    ownerId: string;
    files: Array<{ name: string; size: number }>;
}

export interface RemoveTransferFileInput {
    ownerId: string;
}
