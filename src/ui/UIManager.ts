/**
 * UI Manager for WooJik Engine
 * Centralized UI management system
 */

import { UIElement } from './UIElement';
import { Vector2 } from '../core/types';

export interface UIManagerConfig {
    canvas: HTMLCanvasElement;
    scaleMode?: 'fit' | 'fill' | 'stretch';
    referenceResolution?: Vector2;
}

export class UIManager {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private elements: UIElement[] = [];
    private dirty: boolean = true;
    private scaleMode: 'fit' | 'fill' | 'stretch' = 'fit';
    private referenceResolution: Vector2 = { x: 1920, y: 1080 };
    private scale: Vector2 = { x: 1, y: 1 };
    private offset: Vector2 = { x: 0, y: 0 };

    constructor(config: UIManagerConfig) {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d')!;
        if (config.scaleMode) this.scaleMode = config.scaleMode;
        if (config.referenceResolution) this.referenceResolution = config.referenceResolution;
        this.resize();
    }

    resize(): void {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const refWidth = this.referenceResolution.x;
        const refHeight = this.referenceResolution.y;

        switch (this.scaleMode) {
            case 'fill':
                this.scale.x = width / refWidth;
                this.scale.y = height / refHeight;
                break;
            case 'stretch':
                this.scale.x = width / refWidth;
                this.scale.y = height / refHeight;
                break;
            case 'fit':
            default:
                const scale = Math.min(width / refWidth, height / refHeight);
                this.scale.x = scale;
                this.scale.y = scale;
                this.offset.x = (width - refWidth * scale) / 2;
                this.offset.y = (height - refHeight * scale) / 2;
        }

        this.dirty = true;
    }

    addElement(element: UIElement): void {
        this.elements.push(element);
        element.setManager(this);
        this.dirty = true;
    }

    removeElement(element: UIElement): void {
        const index = this.elements.indexOf(element);
        if (index !== -1) {
            this.elements.splice(index, 1);
            this.dirty = true;
        }
    }

    getElement<T extends UIElement>(id: string): T | undefined {
        return this.elements.find(e => e.id === id) as T | undefined;
    }

    getElements(): UIElement[] {
        return this.elements.slice();
    }

    update(deltaTime: number): void {
        for (const element of this.elements) {
            element.update(deltaTime);
        }
    }

    render(): void {
        if (!this.dirty) return;

        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.scale(this.scale.x, this.scale.y);

        for (const element of this.elements) {
            if (element.visible) {
                element.render(this.ctx);
            }
        }

        this.ctx.restore();
        this.dirty = false;
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    getScale(): Vector2 {
        return { ...this.scale };
    }

    getOffset(): Vector2 {
        return { ...this.offset };
    }

    setScaleMode(mode: 'fit' | 'fill' | 'stretch'): void {
        this.scaleMode = mode;
        this.resize();
    }

    setReferenceResolution(width: number, height: number): void {
        this.referenceResolution = { x: width, y: height };
        this.resize();
    }

    markDirty(): void {
        this.dirty = true;
    }

    destroy(): void {
        this.elements = [];
    }
}