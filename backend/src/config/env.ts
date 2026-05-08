import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port: Number(process.env.PORT ?? 4000),
    clientOrigins: (process.env.CLIENT_ORIGINS ?? process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173,http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    mongoUri: process.env.MONGODB_URI?.trim() || '',
};
