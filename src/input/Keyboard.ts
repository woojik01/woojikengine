/**
 * Keyboard Input Handler for WooJik Engine
 * Handles keyboard input events and state tracking
 */

export class Keyboard {
    private keys: Map<string, boolean> = new Map();
    private keysDown: Map<string, boolean> = new Map();
    private keysUp: Map<string, boolean> = new Map();
    private isInitialized: boolean = false;

    initialize(): void {
        if (this.isInitialized) return;
        this.isInitialized = true;
    }

    handleEvent(event: KeyboardEvent, type: 'keydown' | 'keyup'): void {
        const code = event.code;
        
        if (type === 'keydown') {
            this.keys.set(code, true);
            this.keysDown.set(code, true);
            this.keysUp.delete(code);
        } else {
            this.keys.set(code, false);
            this.keysUp.set(code, true);
            this.keysDown.delete(code);
        }
    }

    isKeyDown(code: string): boolean {
        return this.keys.get(code) === true;
    }

    isKeyPressed(code: string): boolean {
        return this.keysDown.get(code) === true;
    }

    isKeyReleased(code: string): boolean {
        return this.keysUp.get(code) === true;
    }

    getKey(code: string): boolean {
        return this.isKeyDown(code);
    }

    update(): void {
        this.keysDown.clear();
        this.keysUp.clear();
    }

    destroy(): void {
        this.keys.clear();
        this.keysDown.clear();
        this.keysUp.clear();
        this.isInitialized = false;
    }
}