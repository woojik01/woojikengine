/**
 * Audio Manager for WooJik Engine
 * Centralized audio management system
 * Uses Web Audio API
 */

import { AudioSource } from './AudioSource';

export interface AudioManagerConfig {
    masterVolume: number;
    maxSources: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioManagerConfig = {
    masterVolume: 1.0,
    maxSources: 32
};

export class AudioManager {
    private context: AudioContext | null = null;
    private masterVolume: number;
    private sources: Map<string, AudioSource> = new Map();
    private config: AudioManagerConfig;
    private isInitialized: boolean = false;

    constructor(config: Partial<AudioManagerConfig> = {}) {
        this.config = { ...DEFAULT_AUDIO_CONFIG, ...config };
        this.masterVolume = this.config.masterVolume;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.isInitialized = true;
    }

    async loadAudio(url: string, id: string = url): Promise<AudioSource> {
        if (!this.context) {
            await this.initialize();
        }
        
        if (this.sources.has(id)) {
            return this.sources.get(id)!;
        }
        
        const source = new AudioSource(this.context, url);
        await source.load();
        this.sources.set(id, source);
        return source;
    }

    play(id: string, options: Partial<PlayOptions> = {}): void {
        const source = this.sources.get(id);
        if (source) {
            source.play({ 
                volume: this.masterVolume * (options.volume || 1),
                loop: options.loop || false,
                rate: options.rate || 1,
                ...options 
            });
        }
    }

    stop(id: string): void {
        const source = this.sources.get(id);
        if (source) {
            source.stop();
        }
    }

    pause(id: string): void {
        const source = this.sources.get(id);
        if (source) {
            source.pause();
        }
    }

    resume(id: string): void {
        const source = this.sources.get(id);
        if (source) {
            source.resume();
        }
    }

    setVolume(id: string, volume: number): void {
        const source = this.sources.get(id);
        if (source) {
            source.setVolume(volume * this.masterVolume);
        }
    }

    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        for (const source of this.sources.values()) {
            source.setVolume(source.getVolume() / this.masterVolume * this.masterVolume);
        }
    }

    getMasterVolume(): number {
        return this.masterVolume;
    }

    isPlaying(id: string): boolean {
        const source = this.sources.get(id);
        return source ? source.isPlaying() : false;
    }

    getSource(id: string): AudioSource | undefined {
        return this.sources.get(id);
    }

    unload(id: string): void {
        const source = this.sources.get(id);
        if (source) {
            source.stop();
            source.unload();
            this.sources.delete(id);
        }
    }

    unloadAll(): void {
        for (const [id, source] of this.sources) {
            source.stop();
            source.unload();
        }
        this.sources.clear();
    }

    destroy(): void {
        this.unloadAll();
        if (this.context) {
            this.context.close();
            this.context = null;
        }
        this.isInitialized = false;
    }
}

export interface PlayOptions {
    volume: number;
    loop: boolean;
    rate: number;
    startTime: number;
    endTime: number;
}