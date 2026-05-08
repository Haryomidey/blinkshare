import type { ReceiveSession } from '../types/transfer.js';
import type { ReceiveSessionRepository } from '../repositories/ReceiveSessionRepository.js';
import type { RealtimeHub } from './RealtimeHub.js';
import { createId, createPairingCode } from '../utils/ids.js';

export class ReceiveSessionService {
    constructor(
        private readonly sessions: ReceiveSessionRepository,
        private readonly realtime: RealtimeHub
    ) {}

    async create(deviceName = 'Receiving device', ownerId: string) {
        const now = new Date().toISOString();
        const session: ReceiveSession = {
            id: createId('RX'),
            code: createPairingCode(),
            deviceName,
            ownerId,
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

    async pair(code: string) {
        const session = await this.findByCode(code);

        if (!session) {
            throw new Error('Receive session not found');
        }

        if (session.status === 'paired' && !session.transferId) {
            return session;
        }

        if (session.transferId || session.status !== 'waiting') {
            throw new Error('That receive code is no longer available. Create a new receive session and try again.');
        }

        const updatedSession = await this.sessions.update(session.code, { status: 'paired' });
        this.realtime.broadcast({ type: 'receive-session:updated', payload: updatedSession });
        return updatedSession;
    }
}
