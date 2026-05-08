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