/**
 * Gamepad Input Handler for WooJik Engine
 * Handles gamepad input events and state tracking
 */

export interface GamepadState {
    connected: boolean;
    id: string;
    index: number;
    buttons: Float32Array;
    axes: Float32Array;
    timestamp: number;
}

export class Gamepad {
    private gamepads: Map<number, GamepadState> = new Map();
    private isInitialized: boolean = false;

    initialize(): void {
        if (this.isInitialized) return;
        this.isInitialized = true;
    }

    handleEvent(event: GamepadEvent, type: 'gamepadconnected' | 'gamepaddisconnected'): void {
        if (type === 'gamepadconnected' && event.gamepad) {
            this.addGamepad(event.gamepad);
        } else if (type === 'gamepaddisconnected' && event.gamepad) {
            this.removeGamepad(event.gamepad.index);
        }
    }

    private addGamepad(gamepad: Gamepad): void {
        const state: GamepadState = {
            connected: true,
            id: gamepad.id,
            index: gamepad.index,
            buttons: new Float32Array(gamepad.buttons.length),
            axes: new Float32Array(gamepad.axes.length),
            timestamp: performance.now()
        };
        
        for (let i = 0; i < gamepad.buttons.length; i++) {
            state.buttons[i] = gamepad.buttons[i].value;
        }
        for (let i = 0; i < gamepad.axes.length; i++) {
            state.axes[i] = gamepad.axes[i];
        }
        
        this.gamepads.set(gamepad.index, state);
    }

    private removeGamepad(index: number): void {
        this.gamepads.delete(index);
    }

    update(): void {
        const gamepads = navigator.getGamepads();
        
        for (const gp of gamepads) {
            if (gp) {
                const state = this.gamepads.get(gp.index);
                if (state) {
                    state.connected = true;
                    state.timestamp = performance.now();
                    
                    for (let i = 0; i < gp.buttons.length; i++) {
                        state.buttons[i] = gp.buttons[i].value;
                    }
                    for (let i = 0; i < gp.axes.length; i++) {
                        state.axes[i] = gp.axes[i];
                    }
                }
            }
        }
    }

    isConnected(index: number = 0): boolean {
        const state = this.gamepads.get(index);
        return state?.connected === true;
    }

    getButton(index: number, button: number): number {
        const state = this.gamepads.get(index);
        return state?.buttons[button] || 0;
    }

    isButtonDown(index: number, button: number, threshold: number = 0.5): boolean {
        return this.getButton(index, button) > threshold;
    }

    isButtonPressed(index: number, button: number, threshold: number = 0.5): boolean {
        const state = this.gamepads.get(index);
        if (!state) return false;
        return state.buttons[button] > threshold;
    }

    getAxis(index: number, axis: number): number {
        const state = this.gamepads.get(index);
        return state?.axes[axis] || 0;
    }

    getGamepads(): GamepadState[] {
        return Array.from(this.gamepads.values());
    }

    destroy(): void {
        this.gamepads.clear();
        this.isInitialized = false;
    }
}