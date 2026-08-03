/**
 * Collider Component for WooJik Engine
 * Defines collision shapes for entities
 */

import { Component, Entity } from '../core/ECS';
import { Vector2 } from '../core/types';

export type ColliderShapeType = 'aabb' | 'circle' | 'polygon';

export interface AABBShape {
    type: 'aabb';
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface CircleShape {
    type: 'circle';
    center: Vector2;
    radius: number;
}

export interface PolygonShape {
    type: 'polygon';
    vertices: Vector2[];
}

export type ColliderShape = AABBShape | CircleShape | PolygonShape;

export interface Collider extends Component {
    entity: Entity;
    shape: ColliderShape;
    isTrigger: boolean;
    layer: number;
    mask: number;
    offset: Vector2;
}

export function createAABBCollider(
    entity: Entity,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    options: Partial<Omit<Collider, 'entity' | 'shape'>> = {}
): Collider {
    return {
        entity,
        shape: { type: 'aabb', minX, maxX, minY, maxY },
        isTrigger: false,
        layer: 1,
        mask: 1,
        offset: { x: 0, y: 0 },
        ...options
    };
}

export function createCircleCollider(
    entity: Entity,
    radius: number,
    center: Vector2 = { x: 0, y: 0 },
    options: Partial<Omit<Collider, 'entity' | 'shape'>> = {}
): Collider {
    return {
        entity,
        shape: { type: 'circle', center, radius },
        isTrigger: false,
        layer: 1,
        mask: 1,
        offset: { x: 0, y: 0 },
        ...options
    };
}