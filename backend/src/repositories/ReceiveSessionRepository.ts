import type { ReceiveSession } from '../types/transfer.js';
import { ReceiveSessionModel } from '../models/ReceiveSessionModel.js';

export interface ReceiveSessionRepository {
    findByCode(code: string): Promise<ReceiveSession | null>;
    create(session: ReceiveSession): Promise<ReceiveSession>;
    update(code: string, patch: Partial<ReceiveSession>): Promise<ReceiveSession | null>;
}

export class MemoryReceiveSessionRepository implements ReceiveSessionRepository {
    private sessions = new Map<string, ReceiveSession>();

    async findByCode(code: string) {
        return this.sessions.get(code) ?? null;
    }

    async create(session: ReceiveSession) {
        this.sessions.set(session.code, session);
        return session;
    }

    async update(code: string, patch: Partial<ReceiveSession>) {
        const session = this.sessions.get(code);
        if (!session) return null;

        const updated = { ...session, ...patch, updatedAt: new Date().toISOString() };
        this.sessions.set(code, updated);
        return updated;
    }
}

export class MongoReceiveSessionRepository implements ReceiveSessionRepository {
    async findByCode(code: string) {
        return ReceiveSessionModel.findOne({ code }).lean<ReceiveSession | null>();
    }

    async create(session: ReceiveSession) {
        await ReceiveSessionModel.create(session);
        return session;
    }

    async update(code: string, patch: Partial<ReceiveSession>) {
        return ReceiveSessionModel.findOneAndUpdate(
            { code },
            { ...patch, updatedAt: new Date().toISOString() },
            { new: true }
        ).lean<ReceiveSession | null>();
    }
}