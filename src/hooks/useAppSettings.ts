import { useEffect, useMemo, useState } from 'react';

export interface AppSettings {
    deviceName: string;
    autoAccept: boolean;
    discovery: boolean;
    notifyOnComplete: boolean;
    p2pOptimized: boolean;
    secureSignaling: boolean;
    privateMode: boolean;
    deviceId: string;
}

const SETTINGS_KEY = 'blinkshare_settings';

const createDeviceId = () => `#${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const defaultSettings: AppSettings = {
    deviceName: 'Work Laptop',
    autoAccept: false,
    discovery: true,
    notifyOnComplete: true,
    p2pOptimized: true,
    secureSignaling: true,
    privateMode: false,
    deviceId: createDeviceId(),
};

const loadSettings = (): AppSettings => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return defaultSettings;

    try {
        return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
        return defaultSettings;
    }
};

export const useAppSettings = () => {
    const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('blinkshare:settings-updated', { detail: settings }));
    }, [settings]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === SETTINGS_KEY) setSettings(loadSettings());
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const actions = useMemo(() => ({
        updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
            setSettings((current) => ({ ...current, [key]: value }));
        },
        clearSettings: () => setSettings(defaultSettings),
        resetDeviceId: () => setSettings((current) => ({ ...current, deviceId: createDeviceId() })),
    }), []);

    return { settings, ...actions };
};
