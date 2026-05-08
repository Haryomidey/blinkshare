import type { Request, Response } from 'express';
import type {
    CreateTransferInput,
    TransferService,
    UpdateTransferProgressInput,
} from '../services/TransferService.js';
import {
    createTransferSchema,
    updateTransferProgressSchema,
} from './validators.js';

export class TransferController {
    constructor(private readonly transfers: TransferService) {}

    list = async (_request: Request, response: Response) => {
        response.json(await this.transfers.list());
    };

    stats = async (_request: Request, response: Response) => {
        response.json(await this.transfers.stats());
    };

    clear = async (_request: Request, response: Response) => {
        await this.transfers.clear();
        response.status(204).send();
    };

    findById = async (request: Request, response: Response) => {
        const transfer = await this.transfers.findById(String(request.params.id));
        if (!transfer) {
            response.status(404).json({ message: 'Transfer not found' });
            return;
        }

        response.json(transfer);
    };

    create = async (request: Request, response: Response) => {
        const parsed = createTransferSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({ message: 'Invalid transfer payload', issues: parsed.error.issues });
            return;
        }

        try {
            const transfer = await this.transfers.create(parsed.data as unknown as CreateTransferInput);
            response.status(201).json(transfer);
        } catch (error) {
            response.status(400).json({
                message: error instanceof Error ? error.message : 'Unable to create transfer',
            });
        }
    };

    start = async (request: Request, response: Response) => {
        const transfer = await this.transfers.start(String(request.params.id));
        if (!transfer) {
            response.status(404).json({ message: 'Transfer not found' });
            return;
        }

        response.json(transfer);
    };

    cancel = async (request: Request, response: Response) => {
        const transfer = await this.transfers.cancel(String(request.params.id));
        if (!transfer) {
            response.status(404).json({ message: 'Transfer not found' });
            return;
        }

        response.json(transfer);
    };

    updateProgress = async (request: Request, response: Response) => {
        const parsed = updateTransferProgressSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({ message: 'Invalid progress payload', issues: parsed.error.issues });
            return;
        }

        const transfer = await this.transfers.updateProgress(
            String(request.params.id),
            parsed.data as unknown as UpdateTransferProgressInput
        );
        if (!transfer) {
            response.status(404).json({ message: 'Transfer not found' });
            return;
        }

        response.json(transfer);
    };
}
