import type { ReceiveSession } from '../types/transfer.js';
import type { ReceiveSessionRepository } from '../repositories/ReceiveSessionRepository.js';
import type { RealtimeHub } from './RealtimeHub.js';
import { createId, createPairingCode } from '../utils/ids.js';

export class ReceiveSessionService {
    constructor(
        private readonly sessions: ReceiveSessionRepository,
        private readonly realtime: RealtimeHub
    ) {}

    async create(deviceName = 'Receiving device') {
        const now = new Date().toISOString();
        const session: ReceiveSession = {
            id: createId('RX'),
            code: createPairingCode(),
            deviceName,
            status: 'waiting',
            createdAt: now,
            updatedAt: now,
        };

        await this.sessions.create(session);
        this.realtime.broadcast({ type: 'receive-session:updated', payload: session });
        return session;
    }

    findByCode(code: string) {
        return this.sessions.findByCode(code.toUpperCase());
    }
}
