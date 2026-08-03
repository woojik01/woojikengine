/**
 * Touch Input Handler for WooJik Engine
 * Handles touch input events and state tracking
 */

import { Vector2 } from '../core/types';

export interface TouchPoint {
    id: number;
    x: number;
    y: number;
    previousX: number;
    previousY: number;
    deltaX: number;
    deltaY: number;
    force: number;
    isActive: boolean;
}

export interface TouchState {
    touches: Map<number, TouchPoint>;
    activeTouches: TouchPoint[];
    primaryTouch: TouchPoint | null;
}

export class Touch {
    private state: TouchState;
    private canvas: HTMLCanvasElement | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.state = {
            touches: new Map(),
            activeTouches: [],
            primaryTouch: null
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
        
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchEvent(e, 'touchstart'));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEvent(e, 'touchend'));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchEvent(e, 'touchmove'));
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEvent(e, 'touchend'));
    }

    private handleTouchEvent(event: TouchEvent, type: 'touchstart' | 'touchend' | 'touchmove'): void {
        const rect = this.canvas?.getBoundingClientRect();
        if (!rect) return;
        
        const changedTouches = event.changedTouches;
        
        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];
            const touchId = touch.identifier;
            
            const touchPoint: TouchPoint = this.state.touches.get(touchId) || {
                id: touchId,
                x: 0,
                y: 0,
                previousX: 0,
                previousY: 0,
                deltaX: 0,
                deltaY: 0,
                force: touch.force || 1,
                isActive: false
            };
            
            touchPoint.previousX = touchPoint.x;
            touchPoint.previousY = touchPoint.y;
            touchPoint.x = touch.clientX - rect.left;
            touchPoint.y = touch.clientY - rect.top;
            touchPoint.deltaX = touchPoint.x - touchPoint.previousX;
            touchPoint.deltaY = touchPoint.y - touchPoint.previousY;
            touchPoint.force = touch.force || 1;
            
            if (type === 'touchstart') {
                touchPoint.isActive = true;
                this.state.touches.set(touchId, touchPoint);
            } else if (type === 'touchend') {
                touchPoint.isActive = false;
                this.state.touches.delete(touchId);
            }
            
            this.state.touches.set(touchId, touchPoint);
        }
        
        this.updateActiveTouches();
    }

    private updateActiveTouches(): void {
        this.state.activeTouches = Array.from(this.state.touches.values()).filter(t => t.isActive);
        this.state.primaryTouch = this.state.activeTouches[0] || null;
    }

    getTouch(id: number): TouchPoint | undefined {
        return this.state.touches.get(id);
    }

    getPrimaryTouch(): TouchPoint | null {
        return this.state.primaryTouch;
    }

    getActiveTouches(): TouchPoint[] {
        return this.state.activeTouches;
    }

    getPosition(id: number = 0): Vector2 | null {
        const touch = id === 0 ? this.state.primaryTouch : this.state.touches.get(id);
        if (touch) {
            return { x: touch.x, y: touch.y };
        }
        return null;
    }

    getDelta(id: number = 0): Vector2 | null {
        const touch = id === 0 ? this.state.primaryTouch : this.state.touches.get(id);
        if (touch) {
            return { x: touch.deltaX, y: touch.deltaY };
        }
        return null;
    }

    isTouchActive(id: number = 0): boolean {
        const touch = id === 0 ? this.state.primaryTouch : this.state.touches.get(id);
        return touch?.isActive === true;
    }

    getTouchCount(): number {
        return this.state.activeTouches.length;
    }

    update(): void {
        for (const touch of this.state.touches.values()) {
            touch.deltaX = 0;
            touch.deltaY = 0;
        }
    }

    destroy(): void {
        if (!this.canvas) return;
        this.canvas.removeEventListener('touchstart', this.handleTouchEvent);
        this.canvas.removeEventListener('touchend', this.handleTouchEvent);
        this.canvas.removeEventListener('touchmove', this.handleTouchEvent);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEvent);
        this.canvas = null;
        this.state.touches.clear();
        this.state.activeTouches = [];
        this.state.primaryTouch = null;
        this.isInitialized = false;
    }
}