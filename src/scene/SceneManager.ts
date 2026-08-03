/**
 * Scene Manager for WooJik Engine
 * Manages scene transitions and lifecycle
 */

import { World } from '../core/ECS';
import { Scene } from './Scene';

export type SceneTransition = 'instant' | 'fade' | 'slide' | 'custom';

export interface SceneConfig {
    id: string;
    transition?: SceneTransition;
    transitionDuration?: number;
}

export class SceneManager {
    private scenes: Map<string, Scene> = new Map();
    private currentScene: Scene | null = null;
    private nextScene: Scene | null = null;
    private world: World;
    private isTransitioning: boolean = false;
    private transitionProgress: number = 0;
    private transitionDuration: number = 0;

    constructor(world: World) {
        this.world = world;
    }

    registerScene(scene: Scene): void {
        this.scenes.set(scene.id, scene);
        scene.setManager(this);
    }

    unregisterScene(id: string): void {
        const scene = this.scenes.get(id);
        if (scene && scene === this.currentScene) {
            this.exitScene(scene);
        }
        this.scenes.delete(id);
    }

    async loadScene(id: string, config: SceneConfig = { id }): Promise<boolean> {
        if (this.isTransitioning) return false;
        
        const scene = this.scenes.get(id);
        if (!scene) {
            console.error(`Scene not found: ${id}`);
            return false;
        }

        if (this.currentScene) {
            this.isTransitioning = true;
            this.transitionDuration = config.transitionDuration || 0;
            
            if (this.transitionDuration > 0) {
                await this.startTransition(this.currentScene, scene, config.transition || 'instant');
            } else {
                this.switchScene(scene);
            }
        } else {
            this.switchScene(scene);
        }

        return true;
    }

    private async startTransition(from: Scene, to: Scene, type: SceneTransition): Promise<void> {
        this.nextScene = to;
        
        switch (type) {
            case 'fade':
                await this.fadeTransition(from, to);
                break;
            case 'slide':
                await this.slideTransition(from, to);
                break;
            case 'custom':
                await this.customTransition(from, to);
                break;
            default:
                this.switchScene(to);
        }
    }

    private async fadeTransition(from: Scene, to: Scene): Promise<void> {
        const startTime = performance.now();
        
        while (this.transitionProgress < 1) {
            this.transitionProgress = Math.min(1, (performance.now() - startTime) / this.transitionDuration);
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        
        this.switchScene(to);
    }

    private async slideTransition(from: Scene, to: Scene): Promise<void> {
        const startTime = performance.now();
        
        while (this.transitionProgress < 1) {
            this.transitionProgress = Math.min(1, (performance.now() - startTime) / this.transitionDuration);
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        
        this.switchScene(to);
    }

    private async customTransition(from: Scene, to: Scene): Promise<void> {
        if (from.onTransitionOut) {
            await from.onTransitionOut(to);
        }
        if (to.onTransitionIn) {
            await to.onTransitionIn(from);
        }
        this.switchScene(to);
    }

    private switchScene(scene: Scene): void {
        if (this.currentScene) {
            this.exitScene(this.currentScene);
        }
        
        this.currentScene = scene;
        this.nextScene = null;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        
        this.enterScene(scene);
    }

    private enterScene(scene: Scene): void {
        scene.onEnter?.(this.world);
    }

    private exitScene(scene: Scene): void {
        scene.onExit?.(this.world);
    }

    update(deltaTime: number): void {
        if (this.currentScene) {
            this.currentScene.onUpdate?.(this.world, deltaTime);
        }
    }

    getCurrentScene(): Scene | null {
        return this.currentScene;
    }

    getScene(id: string): Scene | undefined {
        return this.scenes.get(id);
    }

    hasScene(id: string): boolean {
        return this.scenes.has(id);
    }

    getAllScenes(): Scene[] {
        return Array.from(this.scenes.values());
    }

    getTransitionProgress(): number {
        return this.transitionProgress;
    }

    isInTransition(): boolean {
        return this.isTransitioning;
    }

    destroy(): void {
        for (const scene of this.scenes.values()) {
            this.exitScene(scene);
        }
        this.scenes.clear();
        this.currentScene = null;
        this.nextScene = null;
    }
}