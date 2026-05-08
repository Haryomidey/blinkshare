import mongoose, { Schema } from 'mongoose';
import type { ReceiveSession } from '../types/transfer.js';

const receiveSessionSchema = new Schema<ReceiveSession>(
    {
        id: { type: String, required: true, unique: true, index: true },
        code: { type: String, required: true, unique: true, index: true },
        deviceName: { type: String, required: true },
        ownerId: { type: String, required: true, index: true },
        status: { type: String, required: true },
        transferId: String,
        createdAt: { type: String, required: true },
        updatedAt: { type: String, required: true },
    },
    { versionKey: false }
);

export const ReceiveSessionModel = mongoose.model<ReceiveSession>('ReceiveSession', receiveSessionSchema);
