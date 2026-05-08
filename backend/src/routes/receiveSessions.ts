import { Router } from 'express';
import type { ReceiveSessionController } from '../controllers/ReceiveSessionController.js';

export const createReceiveSessionRouter = (controller: ReceiveSessionController) => {
    const router = Router();

    router.post('/', controller.create);
    router.get('/:code', controller.findByCode);

    return router;
};