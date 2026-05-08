import { z } from 'zod';

export const createTransferSchema = z.object({
    files: z.array(z.object({
        name: z.string().min(1),
        size: z.number().nonnegative(),
    })).min(1),
    type: z.enum(['sent', 'received']).optional(),
    sender: z.string().optional(),
    receiver: z.string().optional(),
    pairingCode: z.string().optional(),
});


export const createReceiveSessionSchema = z.object({
    deviceName: z.string().min(1).optional(),
});

export const updateTransferProgressSchema = z.object({
    bytesTransferred: z.number().nonnegative(),
    progress: z.number().min(0).max(100),
    speed: z.number().nonnegative().optional(),
    files: z.array(z.object({
        id: z.string(),
        progress: z.number().min(0).max(100),
        status: z.enum(['waiting', 'transferring', 'completed', 'failed']),
    })).optional(),
    status: z.enum(['waiting', 'connecting', 'transferring', 'completed', 'failed', 'cancelled']).optional(),
});
