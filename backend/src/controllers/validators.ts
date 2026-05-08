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
    ownerId: z.string().min(1),
});


export const createReceiveSessionSchema = z.object({
    deviceName: z.string().min(1).optional(),
    ownerId: z.string().min(1),
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

export const addTransferFilesSchema = z.object({
    ownerId: z.string().min(1),
    files: z.array(z.object({
        name: z.string().min(1),
        size: z.number().nonnegative(),
    })).min(1),
});

export const removeTransferFileSchema = z.object({
    ownerId: z.string().min(1),
});
