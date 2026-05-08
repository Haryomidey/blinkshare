import { Router } from 'express';
import type { TransferController } from '../controllers/TransferController.js';

export const createTransferRouter = (controller: TransferController) => {
    const router = Router();

    router.get('/', controller.list);
    router.get('/stats', controller.stats);
    router.delete('/', controller.clear);
    router.get('/:id', controller.findById);
    router.post('/', controller.create);
    router.post('/:id/start', controller.start);
    router.post('/:id/cancel', controller.cancel);
    router.post('/:id/files', controller.addFiles);
    router.delete('/:id/files/:fileId', controller.removeFile);
    router.patch('/:id/progress', controller.updateProgress);

    return router;
};
