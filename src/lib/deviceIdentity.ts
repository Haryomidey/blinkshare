import type { AppSettings } from '@/hooks/useAppSettings.ts';

export const SETTINGS_KEY = 'blinkshare_settings';

export const createDeviceId = () => `DEV-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

export const createDefaultSettings = (): AppSettings => ({
    deviceName: 'Work Laptop',
    autoAccept: false,
    discovery: true,
    notifyOnComplete: true,
    p2pOptimized: true,
    secureSignaling: true,
    privateMode: false,
    deviceId: createDeviceId(),
});

export const getClientDeviceId = () => {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (stored) {
        try {
            const settings = JSON.parse(stored) as Partial<AppSettings>;
            if (settings.deviceId) return settings.deviceId;
        } catch {
            localStorage.removeItem(SETTINGS_KEY);
        }
    }

    const settings = createDefaultSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings.deviceId;
};