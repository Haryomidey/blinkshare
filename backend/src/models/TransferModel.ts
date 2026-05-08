import mongoose, { Schema } from 'mongoose';
import type { Transfer } from '../types/transfer.js';

const transferFileSchema = new Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: Number, required: true },
        progress: { type: Number, required: true },
        status: { type: String, required: true },
    },
    { _id: false }
);

const transferSchema = new Schema<Transfer>(
    {
        id: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        size: { type: Number, required: true },
        status: { type: String, required: true, index: true },
        type: { type: String, required: true },
        sender: String,
        receiver: String,
        files: { type: [transferFileSchema], default: [] },
        progress: { type: Number, required: true },
        bytesTransferred: { type: Number, required: true, default: 0 },
        speed: { type: Number, required: true },
        createdAt: { type: String, required: true },
        updatedAt: { type: String, required: true },
        completedAt: String,
    },
    { versionKey: false }
);

export const TransferModel = mongoose.model<Transfer>('Transfer', transferSchema);
