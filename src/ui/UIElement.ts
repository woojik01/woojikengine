/**
 * UI Element Base Class for WooJik Engine
 * Abstract base class for all UI elements
 */

import { Vector2, Color } from '../core/types';
import { UIManager } from './UIManager';

export type Anchor = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface UIElementConfig {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    anchor?: Anchor;
    pivot?: Vector2;
    visible?: boolean;
    zIndex?: number;
    color?: Color;
    opacity?: number;
}

export abstract class UIElement {
    id: string;
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    anchor: Anchor = 'top-left';
    pivot: Vector2 = { x: 0, y: 0 };
    visible: boolean = true;
    zIndex: number = 0;
    color: Color = { r: 1, g: 1, b: 1, a: 1 };
    opacity: number = 1;
    
    protected manager: UIManager | null = null;
    protected dirty: boolean = true;

    constructor(config: UIElementConfig = {}) {
        this.id = config.id || this.generateId();
        if (config.x !== undefined) this.x = config.x;
        if (config.y !== undefined) this.y = config.y;
        if (config.width !== undefined) this.width = config.width;
        if (config.height !== undefined) this.height = config.height;
        if (config.anchor) this.anchor = config.anchor;
        if (config.pivot) this.pivot = config.pivot;
        if (config.visible !== undefined) this.visible = config.visible;
        if (config.zIndex !== undefined) this.zIndex = config.zIndex;
        if (config.color) this.color = config.color;
        if (config.opacity !== undefined) this.opacity = config.opacity;
    }

    private generateId(): string {
        return 'ui-' + Math.random().toString(36).substr(2, 9);
    }

    setManager(manager: UIManager): void {
        this.manager = manager;
    }

    abstract render(ctx: CanvasRenderingContext2D): void;

    update(deltaTime: number): void {
        // Override in subclasses
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.dirty = true;
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.dirty = true;
    }

    setVisible(visible: boolean): void {
        this.visible = visible;
        this.dirty = true;
    }

    setColor(color: Color): void {
        this.color = color;
        this.dirty = true;
    }

    setOpacity(opacity: number): void {
        this.opacity = Math.max(0, Math.min(1, opacity));
        this.dirty = true;
    }

    setZIndex(zIndex: number): void {
        this.zIndex = zIndex;
        this.dirty = true;
    }

    setAnchor(anchor: Anchor): void {
        this.anchor = anchor;
        this.dirty = true;
    }

    setPivot(pivot: Vector2): void {
        this.pivot = pivot;
        this.dirty = true;
    }

    getBounds(): { x: number; y: number; width: number; height: number } {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    containsPoint(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    markDirty(): void {
        this.dirty = true;
        if (this.manager) {
            this.manager.markDirty();
        }
    }

    destroy(): void {
        // Cleanup
    }
}