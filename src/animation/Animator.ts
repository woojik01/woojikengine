/**
 * Animator for WooJik Engine
 * Controls animation playback for an entity
 */

import { AnimationClip } from './AnimationClip';
import { Vector2, Color } from '../core/types';

export interface AnimatorConfig {
    speed?: number;
    loop?: boolean;
    autoPlay?: boolean;
}

export class Animator {
    private clips: Map<string, AnimationClip> = new Map();
    private currentClip: AnimationClip | null = null;
    private currentClipName: string = '';
    private speed: number = 1.0;
    private loop: boolean = false;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private currentTime: number = 0;
    private onComplete?: () => void;
    private onFrame?: (frameIndex: number) => void;

    constructor(config: AnimatorConfig = {}) {
        if (config.speed !== undefined) this.speed = config.speed;
        if (config.loop !== undefined) this.loop = config.loop;
        if (config.autoPlay) this.isPlaying = true;
    }

    addClip(name: string, clip: AnimationClip): void {
        this.clips.set(name, clip);
        if (!this.currentClip && this.clips.size > 0) {
            this.currentClip = clip;
            this.currentClipName = name;
        }
    }

    removeClip(name: string): void {
        if (this.currentClipName === name) {
            this.currentClip = null;
            this.currentClipName = '';
        }
        this.clips.delete(name);
    }

    getClip(name: string): AnimationClip | undefined {
        return this.clips.get(name);
    }

    play(name?: string): void {
        if (name) {
            const clip = this.clips.get(name);
            if (clip) {
                this.currentClip = clip;
                this.currentClipName = name;
            }
        }
        
        if (!this.currentClip) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        this.currentTime = 0;
    }

    stop(): void {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTime = 0;
    }

    pause(): void {
        if (this.isPlaying) {
            this.isPaused = true;
            this.isPlaying = false;
        }
    }

    resume(): void {
        if (this.isPaused) {
            this.isPaused = false;
            this.isPlaying = true;
        }
    }

    update(deltaTime: number): void {
        if (!this.currentClip || !this.isPlaying) return;
        
        this.currentTime += deltaTime * this.speed * 1000; // Convert to milliseconds
        
        if (this.currentTime >= this.currentClip.duration) {
            if (this.loop) {
                this.currentTime = 0;
            } else {
                this.currentTime = this.currentClip.duration;
                this.isPlaying = false;
                this.onComplete?.();
            }
        }
        
        const frameIndex = this.currentClip.getFrameIndex(this.currentTime);
        this.onFrame?.(frameIndex);
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }

    getSpeed(): number {
        return this.speed;
    }

    setLoop(loop: boolean): void {
        this.loop = loop;
    }

    isLooping(): boolean {
        return this.loop;
    }

    isPlaying(): boolean {
        return this.isPlaying && !this.isPaused;
    }

    isPaused(): boolean {
        return this.isPaused;
    }

    getProgress(): number {
        if (!this.currentClip) return 0;
        return Math.min(1, this.currentTime / this.currentClip.duration);
    }

    getCurrentFrame(): number | undefined {
        if (!this.currentClip) return undefined;
        return this.currentClip.getFrameIndex(this.currentTime);
    }

    getCurrentPosition(): Vector2 | null {
        if (!this.currentClip) return null;
        return this.currentClip.getPosition(this.currentTime);
    }

    getCurrentRotation(): number | null {
        if (!this.currentClip) return null;
        return this.currentClip.getRotation(this.currentTime);
    }

    getCurrentScale(): Vector2 | null {
        if (!this.currentClip) return null;
        return this.currentClip.getScale(this.currentTime);
    }

    getCurrentColor(): Color | null {
        if (!this.currentClip) return null;
        return this.currentClip.getColor(this.currentTime);
    }

    getCurrentClipName(): string {
        return this.currentClipName;
    }

    setOnComplete(callback: () => void): void {
        this.onComplete = callback;
    }

    setOnFrame(callback: (frameIndex: number) => void): void {
        this.onFrame = callback;
    }

    destroy(): void {
        this.clips.clear();
        this.currentClip = null;
        this.currentClipName = '';
        this.onComplete = undefined;
        this.onFrame = undefined;
    }
}