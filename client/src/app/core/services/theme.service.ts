import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface Theme {
    name: string;
    primary: string;
    secondary: string;
    tertiary: string;
}

export const themes: Theme[] = [
    {
        name: 'Sapphire Tech',
        primary: '#2563EB',
        secondary: '#0EA5E9',
        tertiary: '#DBEAFE',
    },
    {
        name: 'Graphite Minimal',
        primary: '#64748B',
        secondary: '#94A3B8',
        tertiary: '#E2E8F0',
    },
    {
        name: 'Indigo Professional',
        primary: '#4F46E5',
        secondary: '#3B82F6',
        tertiary: '#C7D2FE',
    },
    {
        name: 'Emerald Calm',
        primary: '#10B981',
        secondary: '#14B8A6',
        tertiary: '#D1FAE5',
    },
    {
        name: 'Sunset Orange',
        primary: '#F97316',
        secondary: '#F59E0B',
        tertiary: '#FED7AA',
    }
];

const THEME_STORAGE_KEY = 'flashdesk-theme';
const DARK_MODE_STORAGE_KEY = 'flashdesk-dark-mode';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private document = inject(DOCUMENT);

    readonly themes = themes;
    currentTheme = signal<Theme>(this.loadSavedTheme());
    isDarkMode = signal<boolean>(this.loadSavedDarkMode());

    constructor() {
        // Apply theme whenever it changes
        effect(() => {
            this.applyTheme(this.currentTheme());
        });

        // Apply dark mode whenever it changes
        effect(() => {
            this.applyDarkMode(this.isDarkMode());
        });

        // Initial application
        this.applyTheme(this.currentTheme());
        this.applyDarkMode(this.isDarkMode());
    }

    setTheme(theme: Theme) {
        this.currentTheme.set(theme);
        this.saveTheme(theme);
    }

    setThemeByName(name: string) {
        const theme = this.themes.find((t) => t.name === name);
        if (theme) {
            this.setTheme(theme);
        }
    }

    toggleDarkMode() {
        this.isDarkMode.update((v) => !v);
        this.saveDarkMode(this.isDarkMode());
    }

    setDarkMode(value: boolean) {
        this.isDarkMode.set(value);
        this.saveDarkMode(value);
    }

    private applyDarkMode(isDark: boolean) {
        const root = this.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }

    private applyTheme(theme: Theme) {
        const root = this.document.documentElement;

        // Convert hex to RGB for CSS custom properties
        const primaryRgb = this.hexToRgb(theme.primary);
        const secondaryRgb = this.hexToRgb(theme.secondary);
        const tertiaryRgb = this.hexToRgb(theme.tertiary);

        // Set CSS custom properties for the app
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-secondary', theme.secondary);
        root.style.setProperty('--color-tertiary', theme.tertiary);

        // Set RGB values for Tailwind opacity support
        if (primaryRgb) {
            root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
        }
        if (secondaryRgb) {
            root.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
        }
        if (tertiaryRgb) {
            root.style.setProperty('--color-tertiary-rgb', `${tertiaryRgb.r}, ${tertiaryRgb.g}, ${tertiaryRgb.b}`);
        }

        // Generate color shades for PrimeNG
        this.setPrimeNGColors(theme);
    }

    private setPrimeNGColors(theme: Theme) {
        const root = this.document.documentElement;

        // PrimeNG uses p-primary-* CSS variables
        // Generate shades from the primary color
        const shades = this.generateShades(theme.primary);

        root.style.setProperty('--p-primary-50', shades[50]);
        root.style.setProperty('--p-primary-100', shades[100]);
        root.style.setProperty('--p-primary-200', shades[200]);
        root.style.setProperty('--p-primary-300', shades[300]);
        root.style.setProperty('--p-primary-400', shades[400]);
        root.style.setProperty('--p-primary-500', shades[500]);
        root.style.setProperty('--p-primary-600', shades[600]);
        root.style.setProperty('--p-primary-700', shades[700]);
        root.style.setProperty('--p-primary-800', shades[800]);
        root.style.setProperty('--p-primary-900', shades[900]);
        root.style.setProperty('--p-primary-950', shades[950]);

        // Set the main primary color
        root.style.setProperty('--p-primary-color', theme.primary);
        root.style.setProperty('--p-primary-contrast-color', '#ffffff');

        // Update surface colors based on theme
        root.style.setProperty('--p-primary-hover-color', shades[600]);
        root.style.setProperty('--p-primary-active-color', shades[700]);
    }

    private generateShades(hex: string): Record<number, string> {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return {};

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

        return {
            50: this.hslToHex(hsl.h, Math.min(hsl.s * 1.1, 100), 97),
            100: this.hslToHex(hsl.h, Math.min(hsl.s * 1.05, 100), 94),
            200: this.hslToHex(hsl.h, hsl.s, 86),
            300: this.hslToHex(hsl.h, hsl.s, 74),
            400: this.hslToHex(hsl.h, hsl.s, 62),
            500: this.hslToHex(hsl.h, hsl.s, hsl.l), // Original color
            600: this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 8, 0)),
            700: this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 16, 0)),
            800: this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 24, 0)),
            900: this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 32, 0)),
            950: this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 40, 0)),
        };
    }

    private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : null;
    }

    private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    private hslToHex(h: number, s: number, l: number): string {
        s /= 100;
        l /= 100;

        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color)
                .toString(16)
                .padStart(2, '0');
        };

        return `#${f(0)}${f(8)}${f(4)}`;
    }

    private loadSavedTheme(): Theme {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(THEME_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const found = this.themes.find((t) => t.name === parsed.name);
                    if (found) return found;
                } catch {
                    // Ignore parse errors
                }
            }
        }
        return themes[0]; // Default to first theme
    }

    private saveTheme(theme: Theme) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ name: theme.name }));
        }
    }

    private loadSavedDarkMode(): boolean {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
            if (saved !== null) {
                return saved === 'true';
            }
            // Check system preference
            if (typeof window !== 'undefined' && window.matchMedia) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
        }
        return false;
    }

    private saveDarkMode(isDark: boolean) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDark));
        }
    }
}
