import type { Request, Response } from 'express';
import type {
    AddTransferFilesInput,
    CreateTransferInput,
    RemoveTransferFileInput,
    TransferService,
    UpdateTransferProgressInput,
} from '../services/TransferService.js';
import {
    addTransferFilesSchema,
    createTransferSchema,
    removeTransferFileSchema,
    updateTransferProgressSchema,
} from './validators.js';

export class TransferController {
    constructor(private readonly transfers: TransferService) {}

    list = async (request: Request, response: Response) => {
        response.json(await this.transfers.list(String(request.query.ownerId ?? '')));
    };

    stats = async (request: Request, response: Response) => {
        response.json(await this.transfers.stats(String(request.query.ownerId ?? '')));
    };

    clear = async (request: Request, response: Response) => {
        await this.transfers.clear(String(request.query.ownerId ?? ''));
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

    addFiles = async (request: Request, response: Response) => {
        const parsed = addTransferFilesSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({ message: 'Invalid files payload', issues: parsed.error.issues });
            return;
        }

        const result = await this.transfers.addFiles(
            String(request.params.id),
            parsed.data as AddTransferFilesInput
        );
        if (!result) {
            response.status(404).json({ message: 'Transfer not found' });
            return;
        }

        response.json(result);
    };

    removeFile = async (request: Request, response: Response) => {
        const parsed = removeTransferFileSchema.safeParse(request.body);
        if (!parsed.success) {
            response.status(400).json({ message: 'Invalid remove file payload', issues: parsed.error.issues });
            return;
        }

        const transfer = await this.transfers.removeFile(
            String(request.params.id),
            String(request.params.fileId),
            parsed.data as RemoveTransferFileInput
        );
        if (!transfer) {
            response.status(404).json({ message: 'Transfer file not found' });
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
