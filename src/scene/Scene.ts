/**
 * Scene Base Class for WooJik Engine
 * Abstract base class for all scenes
 */

import { World } from '../core/ECS';
import { SceneManager } from './SceneManager';

export abstract class Scene {
    abstract id: string;
    protected manager: SceneManager | null = null;

    setManager(manager: SceneManager): void {
        this.manager = manager;
    }

    onEnter?(world: World): void;
    onExit?(world: World): void;
    onUpdate?(world: World, deltaTime: number): void;
    onTransitionIn?(from: Scene): Promise<void> | void;
    onTransitionOut?(to: Scene): Promise<void> | void;

    getManager(): SceneManager | null {
        return this.manager;
    }

    loadScene(id: string): Promise<boolean> {
        return this.manager?.loadScene(id) || Promise.resolve(false);
    }
}