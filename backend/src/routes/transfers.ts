import { Router } from 'express';
import type { TransferController } from '../controllers/TransferController.js';

export const createTransferRouter = (controller: TransferController) => {
    const router = Router();

    router.get('/', controller.list);
    router.get('/stats', controller.stats);
    router.get('/:id', controller.findById);
    router.post('/', controller.create);
    router.post('/:id/start', controller.start);
    router.post('/:id/cancel', controller.cancel);

    return router;
};