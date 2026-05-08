import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { TransferController } from './controllers/TransferController.js';
import { ReceiveSessionController } from './controllers/ReceiveSessionController.js';
import { createReceiveSessionRouter } from './routes/receiveSessions.js';
import { createTransferRouter } from './routes/transfers.js';
import type { TransferService } from './services/TransferService.js';
import type { ReceiveSessionService } from './services/ReceiveSessionService.js';

interface AppServices {
    transfers: TransferService;
    receiveSessions: ReceiveSessionService;
}

export const createApp = ({ transfers, receiveSessions }: AppServices) => {
    const app = express();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const frontendDistPath = path.resolve(__dirname, '../..', 'dist');

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || env.clientOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`Origin ${origin} is not allowed by CORS`));
        },
        credentials: true,
    }));
    app.use(express.json({ limit: '1mb' }));

    app.get('/health', (_request, response) => {
        response.json({ ok: true, service: 'blinkshare-backend' });
    });

    app.use('/api/transfers', createTransferRouter(new TransferController(transfers)));
    app.use('/api/receive-sessions', createReceiveSessionRouter(new ReceiveSessionController(receiveSessions)));

    if (fs.existsSync(frontendDistPath)) {
        app.use(express.static(frontendDistPath));
        app.get('*', (_request, response) => {
            response.sendFile(path.join(frontendDistPath, 'index.html'));
        });

        return app;
    }

    app.use((_request, response) => {
        response.status(404).json({ message: 'Route not found' });
    });

    return app;
};