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
}

export class TransferService {
    private activeTimers = new Map<string, NodeJS.Timeout>();

    constructor(
        private readonly transfers: TransferRepository,
        private readonly receiveSessions: ReceiveSessionRepository,
        private readonly realtime: RealtimeHub
    ) {}

    list() {
        return this.transfers.list();
    }

    findById(id: string) {
        return this.transfers.findById(id);
    }

    stats(): Promise<TransferStats> {
        return this.transfers.stats();
    }

    async clear() {
        this.activeTimers.forEach((timer) => clearInterval(timer));
        this.activeTimers.clear();
        await this.transfers.clear();
        this.realtime.broadcast({ type: 'transfer:list', payload: [] });
        this.realtime.broadcast({ type: 'stats:updated', payload: await this.transfers.stats() });
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

        if (pairedSession.status !== 'waiting') {
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

    async updateProgress(id: string, input: UpdateTransferProgressInput) {
        const transfer = await this.transfers.findById(id);
        if (!transfer) return null;

        const files = input.files
            ? transfer.files.map((file) => {
                const patch = input.files?.find((item) => item.id === file.id);
                return patch ? { ...file, progress: patch.progress, status: patch.status } : file;
            })
            : transfer.files;
        const updated = await this.transfers.update(id, {
            bytesTransferred: input.bytesTransferred,
            progress: input.progress,
            speed: input.speed ?? transfer.speed,
            files,
            status: input.status ?? transfer.status,
            completedAt: input.status === 'completed' ? new Date().toISOString() : transfer.completedAt,
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
        this.realtime.broadcast({ type: 'transfer:list', payload: await this.transfers.list() });
        this.realtime.broadcast({ type: 'stats:updated', payload: await this.transfers.stats() });
    }
}

export interface UpdateTransferProgressInput {
    bytesTransferred: number;
    progress: number;
    speed?: number;
    files?: Array<{ id: string; progress: number; status: TransferFile['status'] }>;
    status?: Transfer['status'];
}
