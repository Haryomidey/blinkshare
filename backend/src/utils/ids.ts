import crypto from 'node:crypto';

export const createId = (prefix: string) => `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

export const createPairingCode = () => `BLINK-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;