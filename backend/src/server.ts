import http from 'node:http';
import { env } from './config/env.js';
import { connectMongo } from './db/mongoose.js';
import {
    MemoryTransferRepository,
    MongoTransferRepository,
} from './repositories/TransferRepository.js';
import {
    MemoryReceiveSessionRepository,
    MongoReceiveSessionRepository,
} from './repositories/ReceiveSessionRepository.js';
import { RealtimeHub } from './services/RealtimeHub.js';
import { ReceiveSessionService } from './services/ReceiveSessionService.js';
import { TransferService } from './services/TransferService.js';
import { createApp } from './app.js';

const start = async () => {
    const useMongo = await connectMongo();
    const realtime = new RealtimeHub();
    const receiveSessionRepository = useMongo
        ? new MongoReceiveSessionRepository()
        : new MemoryReceiveSessionRepository();
    const transferRepository = useMongo
        ? new MongoTransferRepository()
        : new MemoryTransferRepository();
    const receiveSessions = new ReceiveSessionService(receiveSessionRepository, realtime);
    const transfers = new TransferService(transferRepository, receiveSessionRepository, realtime);
    const app = createApp({ transfers, receiveSessions });
    const server = http.createServer(app);

    realtime.attach(server);

    server.listen(env.port, () => {
        console.log(`BlinkShare backend running on http://localhost:${env.port}`);
    });
};

void start().catch((error) => {
    console.error(error);
    process.exit(1);
});