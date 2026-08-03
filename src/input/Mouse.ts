/**
 * Mouse Input Handler for WooJik Engine
 * Handles mouse input events and state tracking
 */

import { Vector2 } from '../core/types';

export interface MouseState {
    x: number;
    y: number;
    previousX: number;
    previousY: number;
    deltaX: number;
    deltaY: number;
    buttons: Map<number, boolean>;
    buttonsDown: Map<number, boolean>;
    buttonsUp: Map<number, boolean>;
    wheelDelta: number;
    isOverCanvas: boolean;
}

export class Mouse {
    private state: MouseState;
    private canvas: HTMLCanvasElement | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.state = {
            x: 0,
            y: 0,
            previousX: 0,
            previousY: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: new Map(),
            buttonsDown: new Map(),
            buttonsUp: new Map(),
            wheelDelta: 0,
            isOverCanvas: false
        };
    }

    initialize(canvas: HTMLCanvasElement): void {
        if (this.isInitialized) return;
        
        this.canvas = canvas;
        this.setupEventListeners();
        this.isInitialized = true;
    }

    private setupEventListeners(): void {
        if (!this.canvas) return;
        
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseEvent(e, 'mousedown'));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseEvent(e, 'mouseup'));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseEvent(e, 'mousemove'));
        this.canvas.addEventListener('wheel', (e) => this.handleWheelEvent(e));
        this.canvas.addEventListener('mouseenter', () => this.handleMouseEnter());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    }

    private handleMouseEvent(event: MouseEvent, type: 'mousedown' | 'mouseup' | 'mousemove'): void {
        const rect = this.canvas?.getBoundingClientRect();
        if (!rect) return;
        
        this.state.previousX = this.state.x;
        this.state.previousY = this.state.y;
        this.state.x = event.clientX - rect.left;
        this.state.y = event.clientY - rect.top;
        this.state.deltaX = this.state.x - this.state.previousX;
        this.state.deltaY = this.state.y - this.state.previousY;
        
        if (type === 'mousedown') {
            this.state.buttons.set(event.button, true);
            this.state.buttonsDown.set(event.button, true);
            this.state.buttonsUp.delete(event.button);
        } else if (type === 'mouseup') {
            this.state.buttons.set(event.button, false);
            this.state.buttonsUp.set(event.button, true);
            this.state.buttonsDown.delete(event.button);
        }
    }

    private handleWheelEvent(event: WheelEvent): void {
        this.state.wheelDelta = event.deltaY;
    }

    private handleMouseEnter(): void {
        this.state.isOverCanvas = true;
    }

    private handleMouseLeave(): void {
        this.state.isOverCanvas = false;
    }

    getPosition(): Vector2 {
        return { x: this.state.x, y: this.state.y };
    }

    getDelta(): Vector2 {
        return { x: this.state.deltaX, y: this.state.deltaY };
    }

    isButtonDown(button: number): boolean {
        return this.state.buttons.get(button) === true;
    }

    isButtonPressed(button: number): boolean {
        return this.state.buttonsDown.get(button) === true;
    }

    isButtonReleased(button: number): boolean {
        return this.state.buttonsUp.get(button) === true;
    }

    getWheelDelta(): number {
        return this.state.wheelDelta;
    }

    isOverCanvas(): boolean {
        return this.state.isOverCanvas;
    }

    update(): void {
        this.state.deltaX = 0;
        this.state.deltaY = 0;
        this.state.wheelDelta = 0;
        this.state.buttonsDown.clear();
        this.state.buttonsUp.clear();
    }

    destroy(): void {
        if (!this.canvas) return;
        this.canvas.removeEventListener('mousedown', this.handleMouseEvent);
        this.canvas.removeEventListener('mouseup', this.handleMouseEvent);
        this.canvas.removeEventListener('mousemove', this.handleMouseEvent);
        this.canvas.removeEventListener('wheel', this.handleWheelEvent);
        this.canvas = null;
        this.isInitialized = false;
    }
}