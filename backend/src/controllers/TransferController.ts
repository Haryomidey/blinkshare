import type { Request, Response } from 'express';
import type { TransferService } from '../services/TransferService.js';
import { createTransferSchema } from './validators.js';

export class TransferController {
    constructor(private readonly transfers: TransferService) {}

    list = async (_request: Request, response: Response) => {
        response.json(await this.transfers.list());
    };

    stats = async (_request: Request, response: Response) => {
        response.json(await this.transfers.stats());
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

        const transfer = await this.transfers.create(parsed.data);
        response.status(201).json(transfer);
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
}
