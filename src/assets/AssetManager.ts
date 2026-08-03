/**
 * Asset Manager for WooJik Engine
 * Centralized asset loading and management system
 * Zero external dependencies
 */

import { AudioManager } from '../audio/AudioManager';

export type AssetType = 'image' | 'audio' | 'json' | 'text' | 'binary';

export interface Asset<T = unknown> {
    id: string;
    url: string;
    type: AssetType;
    data: T | null;
    loaded: boolean;
    error: Error | null;
    progress: number;
}

export interface AssetLoader<T> {
    (url: string): Promise<T>;
}

export interface LoadOptions {
    onProgress?: (progress: number) => void;
    onLoad?: (asset: Asset) => void;
    onError?: (error: Error) => void;
}

export class AssetManager {
    private assets: Map<string, Asset> = new Map();
    private loaders: Map<AssetType, AssetLoader<unknown>> = new Map();
    private loadingQueue: Asset[] = [];
    private loadedCount: number = 0;
    private totalCount: number = 0;
    private audioManager: AudioManager | null = null;

    constructor(audioManager?: AudioManager) {
        this.audioManager = audioManager || null;
        this.registerDefaultLoaders();
    }

    private registerDefaultLoaders(): void {
        this.loaders.set('image', async (url: string) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
                img.src = url;
            });
        });

        this.loaders.set('audio', async (url: string) => {
            if (this.audioManager) {
                await this.audioManager.loadAudio(url);
                return url;
            }
            return new Promise<string>((resolve, reject) => {
                const audio = new Audio(url);
                audio.addEventListener('canplaythrough', () => resolve(url));
                audio.addEventListener('error', () => reject(new Error(`Failed to load audio: ${url}`)));
                audio.preload = 'auto';
            });
        });

        this.loaders.set('json', async (url: string) => {
            const response = await fetch(url);
            return response.json();
        });

        this.loaders.set('text', async (url: string) => {
            const response = await fetch(url);
            return response.text();
        });

        this.loaders.set('binary', async (url: string) => {
            const response = await fetch(url);
            return response.arrayBuffer();
        });
    }

    async load<T = unknown>(id: string, url: string, type: AssetType, options: LoadOptions = {}): Promise<Asset<T>> {
        if (this.assets.has(id)) {
            return this.assets.get(id)! as Asset<T>;
        }

        const asset: Asset<T> = {
            id,
            url,
            type,
            data: null,
            loaded: false,
            error: null,
            progress: 0
        };

        this.assets.set(id, asset);
        this.loadingQueue.push(asset);
        this.totalCount++;

        try {
            const loader = this.loaders.get(type);
            if (!loader) {
                throw new Error(`No loader registered for type: ${type}`);
            }

            asset.data = await loader(url) as T;
            asset.loaded = true;
            asset.progress = 1;
            this.loadedCount++;
            
            options.onLoad?.(asset);
        } catch (error) {
            asset.error = error as Error;
            asset.loaded = false;
            options.onError?.(error as Error);
        } finally {
            const index = this.loadingQueue.indexOf(asset);
            if (index !== -1) {
                this.loadingQueue.splice(index, 1);
            }
        }

        return asset;
    }

    async loadImage(id: string, url: string, options: LoadOptions = {}): Promise<Asset<HTMLImageElement>> {
        return this.load(id, url, 'image', options);
    }

    async loadAudio(id: string, url: string, options: LoadOptions = {}): Promise<Asset<string>> {
        return this.load(id, url, 'audio', options);
    }

    async loadJSON<T>(id: string, url: string, options: LoadOptions = {}): Promise<Asset<T>> {
        return this.load(id, url, 'json', options);
    }

    async loadText(id: string, url: string, options: LoadOptions = {}): Promise<Asset<string>> {
        return this.load(id, url, 'text', options);
    }

    async loadBinary(id: string, url: string, options: LoadOptions = {}): Promise<Asset<ArrayBuffer>> {
        return this.load(id, url, 'binary', options);
    }

    get<T = unknown>(id: string): Asset<T> | undefined {
        return this.assets.get(id) as Asset<T> | undefined;
    }

    has(id: string): boolean {
        return this.assets.has(id);
    }

    isLoaded(id: string): boolean {
        const asset = this.assets.get(id);
        return asset?.loaded === true;
    }

    getError(id: string): Error | null {
        const asset = this.assets.get(id);
        return asset?.error || null;
    }

    getProgress(id: string): number {
        const asset = this.assets.get(id);
        return asset?.progress || 0;
    }

    getAll(): Asset[] {
        return Array.from(this.assets.values());
    }

    getLoaded(): Asset[] {
        return Array.from(this.assets.values()).filter(a => a.loaded);
    }

    getLoading(): Asset[] {
        return this.loadingQueue.slice();
    }

    getLoadProgress(): number {
        return this.totalCount > 0 ? this.loadedCount / this.totalCount : 0;
    }

    unload(id: string): void {
        const asset = this.assets.get(id);
        if (asset) {
            if (asset.type === 'audio' && this.audioManager) {
                this.audioManager.unload(id);
            }
            asset.data = null;
            asset.loaded = false;
            asset.error = null;
            asset.progress = 0;
        }
    }

    unloadAll(): void {
        for (const [id] of this.assets) {
            this.unload(id);
        }
        this.assets.clear();
        this.loadingQueue = [];
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    registerLoader<T>(type: AssetType, loader: AssetLoader<T>): void {
        this.loaders.set(type, loader as AssetLoader<unknown>);
    }

    destroy(): void {
        this.unloadAll();
        this.loaders.clear();
    }
}