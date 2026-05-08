import type { Request, Response } from 'express';
import type { ReceiveSessionService } from '../services/ReceiveSessionService.js';
import { createReceiveSessionSchema } from './validators.js';

export class ReceiveSessionController {
    constructor(private readonly sessions: ReceiveSessionService) {}

    create = async (request: Request, response: Response) => {
        const parsed = createReceiveSessionSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({ message: 'Invalid receive session payload', issues: parsed.error.issues });
            return;
        }

        response.status(201).json(await this.sessions.create(parsed.data.deviceName, parsed.data.ownerId));
    };

    findByCode = async (request: Request, response: Response) => {
        const session = await this.sessions.findByCode(String(request.params.code));
        if (!session) {
            response.status(404).json({ message: 'Receive session not found' });
            return;
        }

        response.json(session);
    };

    pair = async (request: Request, response: Response) => {
        try {
            const session = await this.sessions.pair(String(request.params.code));
            response.json(session);
        } catch (error) {
            response.status(400).json({
                message: error instanceof Error ? error.message : 'Unable to pair receive session',
            });
        }
    };
}
