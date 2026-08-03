/**
 * Animation Clip for WooJik Engine
 * Defines a single animation sequence
 */

import { Vector2, Color } from '../core/types';

export interface Keyframe {
    time: number; // in milliseconds
    position?: Vector2;
    rotation?: number;
    scale?: Vector2;
    color?: Color;
    frame?: number;
}

export interface AnimationClipConfig {
    name?: string;
    duration?: number;
    frameRate?: number;
    loop?: boolean;
    keyframes?: Keyframe[];
}

export class AnimationClip {
    name: string;
    duration: number;
    frameRate: number;
    loop: boolean;
    keyframes: Keyframe[];
    private sortedKeyframes: Keyframe[] = [];

    constructor(config: AnimationClipConfig = {}) {
        this.name = config.name || '';
        this.duration = config.duration || 0;
        this.frameRate = config.frameRate || 60;
        this.loop = config.loop || false;
        this.keyframes = config.keyframes || [];
        this.sortKeyframes();
    }

    private sortKeyframes(): void {
        this.sortedKeyframes = [...this.keyframes].sort((a, b) => a.time - b.time);
    }

    addKeyframe(keyframe: Keyframe): void {
        this.keyframes.push(keyframe);
        this.sortKeyframes();
        this.duration = Math.max(this.duration, keyframe.time);
    }

    removeKeyframe(index: number): void {
        this.keyframes.splice(index, 1);
        this.sortKeyframes();
        this.updateDuration();
    }

    private updateDuration(): void {
        this.duration = 0;
        for (const kf of this.keyframes) {
            this.duration = Math.max(this.duration, kf.time);
        }
    }

    getFrameIndex(time: number): number {
        if (this.sortedKeyframes.length === 0) return 0;
        
        time = Math.max(0, Math.min(time, this.duration));
        
        for (let i = 0; i < this.sortedKeyframes.length - 1; i++) {
            if (time >= this.sortedKeyframes[i].time && time < this.sortedKeyframes[i + 1].time) {
                return i;
            }
        }
        
        return this.sortedKeyframes.length - 1;
    }

    getPosition(time: number): Vector2 | null {
        const frameIndex = this.getFrameIndex(time);
        const frame = this.sortedKeyframes[frameIndex];
        return frame?.position || null;
    }

    getRotation(time: number): number | null {
        const frameIndex = this.getFrameIndex(time);
        const frame = this.sortedKeyframes[frameIndex];
        return frame?.rotation ?? null;
    }

    getScale(time: number): Vector2 | null {
        const frameIndex = this.getFrameIndex(time);
        const frame = this.sortedKeyframes[frameIndex];
        return frame?.scale || null;
    }

    getColor(time: number): Color | null {
        const frameIndex = this.getFrameIndex(time);
        const frame = this.sortedKeyframes[frameIndex];
        return frame?.color || null;
    }

    getFrame(time: number): number | undefined {
        const frameIndex = this.getFrameIndex(time);
        const frame = this.sortedKeyframes[frameIndex];
        return frame?.frame;
    }

    getInterpolatedPosition(time: number): Vector2 | null {
        return this.interpolateProperty(time, 'position');
    }

    getInterpolatedRotation(time: number): number | null {
        const result = this.interpolateProperty(time, 'rotation');
        return result ? (result as unknown as number) : null;
    }

    getInterpolatedScale(time: number): Vector2 | null {
        return this.interpolateProperty(time, 'scale') as Vector2 | null;
    }

    getInterpolatedColor(time: number): Color | null {
        return this.interpolateProperty(time, 'color') as Color | null;
    }

    private interpolateProperty<T>(time: number, property: keyof Keyframe): T | null {
        if (this.sortedKeyframes.length === 0) return null;
        
        time = Math.max(0, Math.min(time, this.duration));
        
        for (let i = 0; i < this.sortedKeyframes.length - 1; i++) {
            const frame0 = this.sortedKeyframes[i];
            const frame1 = this.sortedKeyframes[i + 1];
            
            if (time >= frame0.time && time <= frame1.time) {
                const t = (time - frame0.time) / (frame1.time - frame0.time);
                const prop0 = frame0[property] as T | undefined;
                const prop1 = frame1[property] as T | undefined;
                
                if (prop0 !== undefined && prop1 !== undefined) {
                    if (typeof prop0 === 'number') {
                        return (prop0 + (prop1 as unknown as number - prop0) * t) as T;
                    } else if (prop0 && typeof prop0 === 'object' && 'x' in prop0 && 'y' in prop0) {
                        const v0 = prop0 as unknown as Vector2;
                        const v1 = prop1 as unknown as Vector2;
                        return {
                            x: v0.x + (v1.x - v0.x) * t,
                            y: v0.y + (v1.y - v0.y) * t
                        } as T;
                    } else if (prop0 && typeof prop0 === 'object' && 'r' in prop0 && 'g' in prop0 && 'b' in prop0) {
                        const c0 = prop0 as unknown as Color;
                        const c1 = prop1 as unknown as Color;
                        return {
                            r: c0.r + (c1.r - c0.r) * t,
                            g: c0.g + (c1.g - c0.g) * t,
                            b: c0.b + (c1.b - c0.b) * t,
                            a: c0.a + (c1.a - c0.a) * t
                        } as T;
                    }
                }
                
                return prop0 || prop1 || null;
            }
        }
        
        const lastFrame = this.sortedKeyframes[this.sortedKeyframes.length - 1];
        return lastFrame?.[property] as T | null;
    }

    clone(): AnimationClip {
        return new AnimationClip({
            name: this.name,
            duration: this.duration,
            frameRate: this.frameRate,
            loop: this.loop,
            keyframes: [...this.keyframes]
        });
    }

    destroy(): void {
        this.keyframes = [];
        this.sortedKeyframes = [];
    }
}

export function createAnimationClip(config: AnimationClipConfig): AnimationClip {
    return new AnimationClip(config);
}