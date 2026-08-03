/**
 * 2D Physics System for WooJik Engine
 * Implements physics simulation using ECS architecture
 * Zero external dependencies - uses only Web APIs
 */

import { System, Entity, World } from '../core/ECS';
import { RigidBody2D } from './RigidBody2D';
import { Collider } from './Collider';
import { Vector2 } from '../core/types';

export interface Physics2DConfig {
    gravity: Vector2;
    iterations: number;
    fixedTimeStep: number;
    maxSubSteps: number;
}

export const DEFAULT_PHYSICS_CONFIG: Physics2DConfig = {
    gravity: { x: 0, y: 9.8 },
    iterations: 10,
    fixedTimeStep: 1/60,
    maxSubSteps: 8
};

export class Physics2DSystem extends System {
    private config: Physics2DConfig;
    private accumulator: number = 0;

    constructor(world: World, config: Partial<Physics2DConfig> = {}) {
        super(world);
        this.config = { ...DEFAULT_PHYSICS_CONFIG, ...config };
    }

    update(deltaTime: number): void {
        deltaTime = Math.min(deltaTime, 0.1);
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.config.fixedTimeStep) {
            this.step(this.config.fixedTimeStep);
            this.accumulator -= this.config.fixedTimeStep;
        }
    }

    private step(deltaTime: number): void {
        const entities = this.world.getEntitiesWithComponents([RigidBody2D, Collider]);
        
        for (const entity of entities) {
            const rigidBody = this.world.getComponent(entity, RigidBody2D);
            if (rigidBody && rigidBody.bodyType === 'dynamic') {
                rigidBody.velocity.y += this.config.gravity.y * deltaTime;
                rigidBody.velocity.x += this.config.gravity.x * deltaTime;
            }
        }

        for (let i = 0; i < this.config.iterations; i++) {
            this.resolveCollisions(entities);
        }

        for (const entity of entities) {
            const rigidBody = this.world.getComponent(entity, RigidBody2D);
            if (rigidBody && rigidBody.bodyType === 'dynamic') {
                const transform = this.world.getComponent(entity, 'Transform');
                if (transform) {
                    transform.position.x += rigidBody.velocity.x * deltaTime;
                    transform.position.y += rigidBody.velocity.y * deltaTime;
                }
            }
        }
    }

    private resolveCollisions(entities: Entity[]): void {
        const length = entities.length;
        for (let i = 0; i < length; i++) {
            for (let j = i + 1; j < length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];
                const colliderA = this.world.getComponent(entityA, Collider);
                const colliderB = this.world.getComponent(entityB, Collider);
                const rigidBodyA = this.world.getComponent(entityA, RigidBody2D);
                const rigidBodyB = this.world.getComponent(entityB, RigidBody2D);
                
                if (colliderA && colliderB && rigidBodyA && rigidBodyB) {
                    const collision = this.checkCollision(colliderA, colliderB);
                    if (collision) {
                        this.resolveCollision(collision, rigidBodyA, rigidBodyB);
                    }
                }
            }
        }
    }

    private checkCollision(colliderA: Collider, colliderB: Collider): CollisionInfo | null {
        if (colliderA.shape.type === 'aabb' && colliderB.shape.type === 'aabb') {
            const aabbA = colliderA.shape as AABB;
            const aabbB = colliderB.shape as AABB;
            const overlapX = Math.min(aabbA.maxX, aabbB.maxX) - Math.max(aabbA.minX, aabbB.minX);
            const overlapY = Math.min(aabbA.maxY, aabbB.maxY) - Math.max(aabbA.minY, aabbB.minY);
            if (overlapX > 0 && overlapY > 0) {
                return {
                    normal: { x: 0, y: 0 },
                    depth: Math.min(overlapX, overlapY),
                    entityA: colliderA.entity,
                    entityB: colliderB.entity
                };
            }
        }
        if (colliderA.shape.type === 'circle' && colliderB.shape.type === 'circle') {
            const circleA = colliderA.shape as Circle;
            const circleB = colliderB.shape as Circle;
            const dx = circleB.center.x - circleA.center.x;
            const dy = circleB.center.y - circleA.center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radiusSum = circleA.radius + circleB.radius;
            if (distance < radiusSum) {
                const normal = { x: dx / distance, y: dy / distance };
                return {
                    normal,
                    depth: radiusSum - distance,
                    entityA: colliderA.entity,
                    entityB: colliderB.entity
                };
            }
        }
        return null;
    }

    private resolveCollision(collision: CollisionInfo, bodyA: RigidBody2D, bodyB: RigidBody2D): void {
        const totalMass = bodyA.mass + bodyB.mass;
        const massRatioA = bodyB.mass / totalMass;
        const massRatioB = bodyA.mass / totalMass;
        const transformA = this.world.getComponent(collision.entityA, 'Transform');
        const transformB = this.world.getComponent(collision.entityB, 'Transform');
        if (transformA && transformB) {
            transformA.position.x -= collision.normal.x * collision.depth * massRatioA;
            transformA.position.y -= collision.normal.y * collision.depth * massRatioA;
            transformB.position.x += collision.normal.x * collision.depth * massRatioB;
            transformB.position.y += collision.normal.y * collision.depth * massRatioB;
        }
    }
}

export interface CollisionInfo {
    normal: Vector2;
    depth: number;
    entityA: Entity;
    entityB: Entity;
}

export interface AABB {
    type: 'aabb';
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface Circle {
    type: 'circle';
    center: Vector2;
    radius: number;
}

export type ColliderShape = AABB | Circle;