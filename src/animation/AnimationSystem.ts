/**
 * Animation System for WooJik Engine
 * Manages animation updates for all entities
 */

import { System, World, Entity } from '../core/ECS';
import { Animator } from './Animator';

export class AnimationSystem extends System {
    private animators: Map<Entity, Animator> = new Map();

    constructor(world: World) {
        super(world);
    }

    addAnimator(entity: Entity, animator: Animator): void {
        this.animators.set(entity, animator);
    }

    removeAnimator(entity: Entity): void {
        this.animators.delete(entity);
    }

    getAnimator(entity: Entity): Animator | undefined {
        return this.animators.get(entity);
    }

    update(deltaTime: number): void {
        for (const [entity, animator] of this.animators) {
            const transform = this.world.getComponent(entity, 'Transform');
            const sprite = this.world.getComponent(entity, 'Sprite');
            
            if (transform || sprite) {
                animator.update(deltaTime);
                
                // Apply animation to transform
                if (transform) {
                    const position = animator.getCurrentPosition();
                    const rotation = animator.getCurrentRotation();
                    const scale = animator.getCurrentScale();
                    
                    if (position) {
                        transform.position.x = position.x;
                        transform.position.y = position.y;
                    }
                    if (rotation !== undefined) {
                        transform.rotation = rotation;
                    }
                    if (scale) {
                        transform.scale.x = scale.x;
                        transform.scale.y = scale.y;
                    }
                }
                
                // Apply animation to sprite
                if (sprite) {
                    const frame = animator.getCurrentFrame();
                    if (frame !== undefined) {
                        sprite.frame = frame;
                    }
                    const color = animator.getCurrentColor();
                    if (color) {
                        sprite.color = color;
                    }
                }
            }
        }
    }

    playAnimation(entity: Entity, animationName: string): void {
        const animator = this.animators.get(entity);
        if (animator) {
            animator.play(animationName);
        }
    }

    stopAnimation(entity: Entity): void {
        const animator = this.animators.get(entity);
        if (animator) {
            animator.stop();
        }
    }

    pauseAnimation(entity: Entity): void {
        const animator = this.animators.get(entity);
        if (animator) {
            animator.pause();
        }
    }

    resumeAnimation(entity: Entity): void {
        const animator = this.animators.get(entity);
        if (animator) {
            animator.resume();
        }
    }

    setAnimationSpeed(entity: Entity, speed: number): void {
        const animator = this.animators.get(entity);
        if (animator) {
            animator.setSpeed(speed);
        }
    }

    getAnimationProgress(entity: Entity): number {
        const animator = this.animators.get(entity);
        return animator?.getProgress() || 0;
    }

    destroy(): void {
        this.animators.clear();
    }
}