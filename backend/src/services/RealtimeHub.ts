import { WebSocketServer, type WebSocket } from 'ws';
import type { Server } from 'node:http';

export type RealtimeEvent =
    | { type: 'transfer:list'; payload: unknown }
    | { type: 'transfer:updated'; payload: unknown }
    | { type: 'stats:updated'; payload: unknown }
    | { type: 'receive-session:updated'; payload: unknown };

export class RealtimeHub {
    private wss?: WebSocketServer;

    attach(server: Server) {
        this.wss = new WebSocketServer({ server, path: '/realtime' });

        this.wss.on('connection', (socket) => {
            socket.send(JSON.stringify({ type: 'connected', payload: { ok: true } }));
        });
    }

    broadcast(event: RealtimeEvent) {
        const message = JSON.stringify(event);

        this.wss?.clients.forEach((client: WebSocket) => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }
}
