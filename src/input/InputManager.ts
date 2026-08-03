/**
 * Input Manager for WooJik Engine
 * Centralized input handling system
 * Zero external dependencies - uses only Web APIs
 */

import { System, World } from '../core/ECS';
import { Keyboard } from './Keyboard';
import { Mouse } from './Mouse';
import { Touch } from './Touch';
import { Gamepad } from './Gamepad';

export type InputDeviceType = 'keyboard' | 'mouse' | 'touch' | 'gamepad';

export interface InputEvent {
    type: 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'mousemove' | 'touchstart' | 'touchend' | 'touchmove' | 'gamepadconnected' | 'gamepaddisconnected';
    deviceType: InputDeviceType;
    timestamp: number;
    [key: string]: unknown;
}

export type InputCallback = (event: InputEvent) => void;

export class InputManager extends System {
    private keyboard: Keyboard;
    private mouse: Mouse;
    private touch: Touch;
    private gamepad: Gamepad;
    private listeners: Map<string, InputCallback[]> = new Map();
    private isInitialized: boolean = false;

    constructor(world: World) {
        super(world);
        this.keyboard = new Keyboard();
        this.mouse = new Mouse();
        this.touch = new Touch();
        this.gamepad = new Gamepad();
    }

    initialize(canvas: HTMLCanvasElement): void {
        if (this.isInitialized) return;
        
        this.keyboard.initialize();
        this.mouse.initialize(canvas);
        this.touch.initialize(canvas);
        this.gamepad.initialize();
        
        this.setupEventListeners();
        this.isInitialized = true;
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (e) => this.handleKeyEvent(e, 'keydown'));
        window.addEventListener('keyup', (e) => this.handleKeyEvent(e, 'keyup'));
        window.addEventListener('gamepadconnected', (e) => this.handleGamepadEvent(e, 'gamepadconnected'));
        window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadEvent(e, 'gamepaddisconnected'));
    }

    private handleKeyEvent(event: KeyboardEvent, type: 'keydown' | 'keyup'): void {
        this.keyboard.handleEvent(event, type);
        const inputEvent: InputEvent = {
            type,
            deviceType: 'keyboard',
            timestamp: performance.now(),
            code: event.code,
            key: event.key,
            repeat: event.repeat,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        };
        this.emit(inputEvent);
    }

    private handleGamepadEvent(event: GamepadEvent, type: 'gamepadconnected' | 'gamepaddisconnected'): void {
        this.gamepad.handleEvent(event, type);
        const inputEvent: InputEvent = {
            type,
            deviceType: 'gamepad',
            timestamp: performance.now(),
            gamepad: event.gamepad
        };
        this.emit(inputEvent);
    }

    update(): void {
        this.mouse.update();
        this.touch.update();
        this.gamepad.update();
    }

    on(eventType: string, callback: InputCallback): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(callback);
    }

    off(eventType: string, callback: InputCallback): void {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    private emit(event: InputEvent): void {
        const callbacks = this.listeners.get(event.type);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(event);
            }
        }
    }

    getKeyboard(): Keyboard {
        return this.keyboard;
    }

    getMouse(): Mouse {
        return this.mouse;
    }

    getTouch(): Touch {
        return this.touch;
    }

    getGamepad(): Gamepad {
        return this.gamepad;
    }

    destroy(): void {
        this.keyboard.destroy();
        this.mouse.destroy();
        this.touch.destroy();
        this.gamepad.destroy();
        this.listeners.clear();
        this.isInitialized = false;
    }
}