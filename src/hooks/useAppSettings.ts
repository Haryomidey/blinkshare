import { useEffect, useMemo, useState } from 'react';
import { createDefaultSettings, createDeviceId, SETTINGS_KEY } from '@/lib/deviceIdentity.ts';

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

const loadSettings = (): AppSettings => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const defaults = createDefaultSettings();
    if (!stored) return defaults;

    try {
        return { ...defaults, ...JSON.parse(stored) };
    } catch {
        return defaults;
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
        const handleSettingsUpdated = (event: Event) => {
            const nextSettings = (event as CustomEvent<AppSettings>).detail;
            if (nextSettings) setSettings(nextSettings);
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('blinkshare:settings-updated', handleSettingsUpdated);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('blinkshare:settings-updated', handleSettingsUpdated);
        };
    }, []);

    const actions = useMemo(() => ({
        updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
            setSettings((current) => ({ ...current, [key]: value }));
        },
        clearSettings: () => setSettings(createDefaultSettings()),
        resetDeviceId: () => setSettings((current) => ({ ...current, deviceId: createDeviceId() })),
    }), []);

    return { settings, ...actions };
};
