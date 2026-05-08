import mongoose from 'mongoose';
import { env } from '../config/env.js';

export const connectMongo = async () => {
    if (!env.mongoUri) {
        console.log('MongoDB not configured. Using in-memory storage.');
        return false;
    }

    try {
        await mongoose.connect(env.mongoUri);
        console.log('MongoDB connected.');
        return true;
    } catch (error) {
        console.warn('MongoDB connection failed. Falling back to in-memory storage.');
        return false;
    }
};
