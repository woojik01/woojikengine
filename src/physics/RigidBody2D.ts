/**
 * RigidBody2D Component for WooJik Engine
 * Defines physical properties for entities
 */

import { Component } from '../core/ECS';
import { Vector2 } from '../core/types';

export type BodyType = 'static' | 'dynamic' | 'kinematic';

export interface RigidBody2D extends Component {
    bodyType: BodyType;
    mass: number;
    velocity: Vector2;
    acceleration: Vector2;
    friction: number;
    restitution: number;
    angularVelocity: number;
    rotation: number;
    gravityScale: number;
    fixedRotation: boolean;
    continuousCollision: boolean;
}

export function createRigidBody2D(
    bodyType: BodyType = 'dynamic',
    options: Partial<Omit<RigidBody2D, 'bodyType'>> = {}
): RigidBody2D {
    return {
        bodyType,
        mass: 1,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        friction: 0.2,
        restitution: 0.5,
        angularVelocity: 0,
        rotation: 0,
        gravityScale: 1,
        fixedRotation: false,
        continuousCollision: false,
        ...options
    };
}

export function applyForce(rigidBody: RigidBody2D, force: Vector2): void {
    rigidBody.acceleration.x += force.x / rigidBody.mass;
    rigidBody.acceleration.y += force.y / rigidBody.mass;
}

export function applyImpulse(rigidBody: RigidBody2D, impulse: Vector2): void {
    rigidBody.velocity.x += impulse.x / rigidBody.mass;
    rigidBody.velocity.y += impulse.y / rigidBody.mass;
}