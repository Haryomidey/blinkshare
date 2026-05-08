import type { Transfer, TransferStats } from '../types/transfer.js';
import { TransferModel } from '../models/TransferModel.js';

export interface TransferRepository {
    list(ownerId?: string): Promise<Transfer[]>;
    findById(id: string): Promise<Transfer | null>;
    create(transfer: Transfer): Promise<Transfer>;
    update(id: string, patch: Partial<Transfer>): Promise<Transfer | null>;
    clear(ownerId?: string): Promise<void>;
    stats(ownerId?: string): Promise<TransferStats>;
}

const sortNewest = (items: Transfer[]) =>
    [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const transferForOwner = (transfer: Transfer, ownerId?: string): Transfer => ({
    ...transfer,
    type: ownerId && transfer.receiverOwnerId === ownerId ? 'received' : 'sent',
});

const calculateStats = (items: Transfer[]): TransferStats => {
    const completed = items.filter((transfer) => transfer.status === 'completed');
    const speedSamples = completed.map((transfer) => transfer.speed).filter((speed) => speed > 0);

    return {
        totalSent: items.filter((transfer) => transfer.type === 'sent').length,
        totalReceived: items.filter((transfer) => transfer.type === 'received').length,
        totalTransferred: completed.reduce((total, transfer) => total + transfer.size, 0),
        averageSpeed: speedSamples.length
            ? Math.round(speedSamples.reduce((total, speed) => total + speed, 0) / speedSamples.length)
            : 0,
    };
};

export class MemoryTransferRepository implements TransferRepository {
    private transfers = new Map<string, Transfer>();

    async list(ownerId?: string) {
        if (!ownerId) return [];

        const transfers = [...this.transfers.values()];
        const scopedTransfers = transfers.filter((transfer) => transfer.ownerIds?.includes(ownerId));

        return sortNewest(scopedTransfers.map((transfer) => transferForOwner(transfer, ownerId)));
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

    async clear(ownerId?: string) {
        if (!ownerId) {
            return;
        }

        [...this.transfers.values()]
            .filter((transfer) => transfer.ownerIds?.includes(ownerId))
            .forEach((transfer) => {
                const ownerIds = transfer.ownerIds.filter((id) => id !== ownerId);
                if (ownerIds.length === 0) {
                    this.transfers.delete(transfer.id);
                    return;
                }

                this.transfers.set(transfer.id, { ...transfer, ownerIds, updatedAt: new Date().toISOString() });
            });
    }

    async stats(ownerId?: string) {
        return calculateStats(await this.list(ownerId));
    }
}

export class MongoTransferRepository implements TransferRepository {
    async list(ownerId?: string) {
        if (!ownerId) return [];

        const transfers = await TransferModel.find({ ownerIds: ownerId }).sort({ createdAt: -1 }).lean<Transfer[]>();
        return transfers.map((transfer) => transferForOwner(transfer, ownerId));
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

    async clear(ownerId?: string) {
        if (!ownerId) return;

        await TransferModel.updateMany(
            { ownerIds: ownerId },
            { $pull: { ownerIds: ownerId }, updatedAt: new Date().toISOString() }
        );
        await TransferModel.deleteMany({ ownerIds: { $size: 0 } });
    }

    async stats(ownerId?: string) {
        return calculateStats(await this.list(ownerId));
    }
}
