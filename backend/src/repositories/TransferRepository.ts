import type { Transfer, TransferStats } from '../types/transfer.js';
import { TransferModel } from '../models/TransferModel.js';

export interface TransferRepository {
    list(): Promise<Transfer[]>;
    findById(id: string): Promise<Transfer | null>;
    create(transfer: Transfer): Promise<Transfer>;
    update(id: string, patch: Partial<Transfer>): Promise<Transfer | null>;
    clear(): Promise<void>;
    stats(): Promise<TransferStats>;
}

const sortNewest = (items: Transfer[]) =>
    [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const calculateStats = (items: Transfer[]): TransferStats => {
    const completed = items.filter((transfer) => transfer.status === 'completed');
    const speedSamples = completed.map((transfer) => transfer.speed).filter((speed) => speed > 0);
    const pairedTransfers = items.filter((transfer) => Boolean(transfer.receiver));

    return {
        totalSent: items.filter((transfer) => transfer.type === 'sent').length,
        totalReceived: items.filter((transfer) => transfer.type === 'received').length + pairedTransfers.length,
        totalTransferred: completed.reduce((total, transfer) => total + transfer.size, 0),
        averageSpeed: speedSamples.length
            ? Math.round(speedSamples.reduce((total, speed) => total + speed, 0) / speedSamples.length)
            : 0,
    };
};

export class MemoryTransferRepository implements TransferRepository {
    private transfers = new Map<string, Transfer>();

    async list() {
        return sortNewest([...this.transfers.values()]);
    }

    async findById(id: string) {
        return this.transfers.get(id) ?? null;
    }

    async create(transfer: Transfer) {
        this.transfers.set(transfer.id, transfer);
        return transfer;
    }

    async update(id: string, patch: Partial<Transfer>) {
        const transfer = this.transfers.get(id);
        if (!transfer) return null;

        const updated = { ...transfer, ...patch, updatedAt: new Date().toISOString() };
        this.transfers.set(id, updated);
        return updated;
    }

    async clear() {
        this.transfers.clear();
    }

    async stats() {
        return calculateStats([...this.transfers.values()]);
    }
}

export class MongoTransferRepository implements TransferRepository {
    async list() {
        return TransferModel.find().sort({ createdAt: -1 }).lean<Transfer[]>();
    }

    async findById(id: string) {
        return TransferModel.findOne({ id }).lean<Transfer | null>();
    }

    async create(transfer: Transfer) {
        await TransferModel.create(transfer);
        return transfer;
    }

    async update(id: string, patch: Partial<Transfer>) {
        return TransferModel.findOneAndUpdate(
            { id },
            { ...patch, updatedAt: new Date().toISOString() },
            { new: true }
        ).lean<Transfer | null>();
    }

    async clear() {
        await TransferModel.deleteMany({});
    }

    async stats() {
        return calculateStats(await this.list());
    }
}
