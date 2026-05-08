import { WebSocketServer, type WebSocket } from 'ws';
import type { Server } from 'node:http';

export type RealtimeEvent =
    | { type: 'transfer:list'; ownerId?: string; payload: unknown }
    | { type: 'transfer:updated'; payload: unknown }
    | { type: 'stats:updated'; ownerId?: string; payload: unknown }
    | { type: 'receive-session:updated'; payload: unknown };

type ClientMessage =
    | { type: 'signal:join'; transferId: string; role: 'sender' | 'receiver' }
    | { type: 'signal:offer' | 'signal:answer' | 'signal:ice'; transferId: string; payload: unknown };

export class RealtimeHub {
    private wss?: WebSocketServer;
    private rooms = new Map<string, Set<WebSocket>>();

    attach(server: Server) {
        this.wss = new WebSocketServer({ server, path: '/realtime' });

        this.wss.on('connection', (socket) => {
            socket.send(JSON.stringify({ type: 'connected', payload: { ok: true } }));

            socket.on('message', (rawMessage) => {
                const message = this.parseClientMessage(rawMessage.toString());
                if (!message) return;

                if (message.type === 'signal:join') {
                    this.joinRoom(message.transferId, socket);
                    this.broadcastToRoom(message.transferId, {
                        type: 'signal:peer-joined',
                        payload: { role: message.role },
                    }, socket);
                    return;
                }

                this.broadcastToRoom(message.transferId, {
                    type: message.type,
                    payload: message.payload,
                }, socket);
            });

            socket.on('close', () => {
                this.rooms.forEach((clients) => clients.delete(socket));
            });
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

    private joinRoom(transferId: string, socket: WebSocket) {
        const room = this.rooms.get(transferId) ?? new Set<WebSocket>();
        room.add(socket);
        this.rooms.set(transferId, room);
    }

    private broadcastToRoom(transferId: string, event: { type: string; payload: unknown }, sender: WebSocket) {
        const message = JSON.stringify(event);
        this.rooms.get(transferId)?.forEach((client) => {
            if (client !== sender && client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }

    private parseClientMessage(rawMessage: string): ClientMessage | null {
        try {
            return JSON.parse(rawMessage) as ClientMessage;
        } catch {
            return null;
        }
    }
}
