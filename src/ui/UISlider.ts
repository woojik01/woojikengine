/**
 * UI Slider Element for WooJik Engine
 * Interactive slider element
 */

import { UIElement, UIElementConfig } from './UIElement';
import { Color, Vector2 } from '../core/types';

export type SliderOrientation = 'horizontal' | 'vertical';

export interface UISliderConfig extends UIElementConfig {
    min?: number;
    max?: number;
    value?: number;
    step?: number;
    orientation?: SliderOrientation;
    trackColor?: Color;
    thumbColor?: Color;
    trackHeight?: number;
    thumbSize?: number;
    onChange?: (value: number) => void;
    onSlide?: (value: number) => void;
}

export class UISlider extends UIElement {
    min: number = 0;
    max: number = 100;
    value: number = 50;
    step: number = 1;
    orientation: SliderOrientation = 'horizontal';
    trackColor: Color = { r: 0.3, g: 0.3, b: 0.3, a: 1 };
    thumbColor: Color = { r: 0.5, g: 0.5, b: 0.5, a: 1 };
    trackHeight: number = 4;
    thumbSize: number = 16;
    
    private isDragging: boolean = false;
    private dragOffset: number = 0;
    
    onChange?: (value: number) => void;
    onSlide?: (value: number) => void;

    constructor(config: UISliderConfig = {}) {
        super(config);
        if (config.min !== undefined) this.min = config.min;
        if (config.max !== undefined) this.max = config.max;
        if (config.value !== undefined) this.value = this.clampValue(config.value);
        if (config.step !== undefined) this.step = config.step;
        if (config.orientation) this.orientation = config.orientation;
        if (config.trackColor) this.trackColor = config.trackColor;
        if (config.thumbColor) this.thumbColor = config.thumbColor;
        if (config.trackHeight !== undefined) this.trackHeight = config.trackHeight;
        if (config.thumbSize !== undefined) this.thumbSize = config.thumbSize;
        if (config.onChange) this.onChange = config.onChange;
        if (config.onSlide) this.onSlide = config.onSlide;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;

        ctx.save();
        
        // Draw track
        const trackColorStr = `rgba(${Math.floor(this.trackColor.r * 255)}, ${Math.floor(this.trackColor.g * 255)}, ${Math.floor(this.trackColor.b * 255)}, ${this.trackColor.a * this.opacity})`;
        ctx.fillStyle = trackColorStr;
        
        if (this.orientation === 'horizontal') {
            const trackY = this.y + this.height / 2 - this.trackHeight / 2;
            ctx.fillRect(this.x, trackY, this.width, this.trackHeight);
        } else {
            const trackX = this.x + this.width / 2 - this.trackHeight / 2;
            ctx.fillRect(trackX, this.y, this.trackHeight, this.height);
        }
        
        // Draw thumb
        const thumbColorStr = `rgba(${Math.floor(this.thumbColor.r * 255)}, ${Math.floor(this.thumbColor.g * 255)}, ${Math.floor(this.thumbColor.b * 255)}, ${this.thumbColor.a * this.opacity})`;
        ctx.fillStyle = thumbColorStr;
        
        const percent = (this.value - this.min) / (this.max - this.min);
        
        if (this.orientation === 'horizontal') {
            const thumbX = this.x + percent * this.width - this.thumbSize / 2;
            const thumbY = this.y + this.height / 2 - this.thumbSize / 2;
            ctx.beginPath();
            ctx.arc(thumbX + this.thumbSize / 2, thumbY + this.thumbSize / 2, this.thumbSize / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const thumbX = this.x + this.width / 2 - this.thumbSize / 2;
            const thumbY = this.y + (1 - percent) * this.height - this.thumbSize / 2;
            ctx.beginPath();
            ctx.arc(thumbX + this.thumbSize / 2, thumbY + this.thumbSize / 2, this.thumbSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    private clampValue(value: number): number {
        const stepped = Math.round(value / this.step) * this.step;
        return Math.max(this.min, Math.min(this.max, stepped));
    }

    setValue(value: number): void {
        const oldValue = this.value;
        this.value = this.clampValue(value);
        if (oldValue !== this.value) {
            this.onChange?.(this.value);
            this.markDirty();
        }
    }

    getValue(): number {
        return this.value;
    }

    setMin(min: number): void {
        this.min = min;
        this.value = this.clampValue(this.value);
        this.markDirty();
    }

    setMax(max: number): void {
        this.max = max;
        this.value = this.clampValue(this.value);
        this.markDirty();
    }

    setRange(min: number, max: number): void {
        this.min = min;
        this.max = max;
        this.value = this.clampValue(this.value);
        this.markDirty();
    }

    setStep(step: number): void {
        this.step = step;
        this.value = this.clampValue(this.value);
        this.markDirty();
    }

    handlePointerDown(x: number, y: number): boolean {
        const thumbPercent = (this.value - this.min) / (this.max - this.min);
        let thumbX: number, thumbY: number;
        
        if (this.orientation === 'horizontal') {
            thumbX = this.x + thumbPercent * this.width;
            thumbY = this.y + this.height / 2;
        } else {
            thumbX = this.x + this.width / 2;
            thumbY = this.y + (1 - thumbPercent) * this.height;
        }
        
        const distance = Math.sqrt(
            Math.pow(x - thumbX, 2) + Math.pow(y - thumbY, 2)
        );
        
        if (distance <= this.thumbSize / 2) {
            this.isDragging = true;
            this.dragOffset = this.orientation === 'horizontal' ? 
                x - (this.x + thumbPercent * this.width) : 
                y - (this.y + (1 - thumbPercent) * this.height);
            return true;
        }
        
        // Check if clicked on track
        if (this.orientation === 'horizontal') {
            if (x >= this.x && x <= this.x + this.width && 
                y >= this.y + this.height / 2 - this.trackHeight / 2 && 
                y <= this.y + this.height / 2 + this.trackHeight / 2) {
                this.isDragging = true;
                this.updateValueFromPointer(x, y);
                return true;
            }
        } else {
            if (y >= this.y && y <= this.y + this.height && 
                x >= this.x + this.width / 2 - this.trackHeight / 2 && 
                x <= this.x + this.width / 2 + this.trackHeight / 2) {
                this.isDragging = true;
                this.updateValueFromPointer(x, y);
                return true;
            }
        }
        
        return false;
    }

    handlePointerMove(x: number, y: number): void {
        if (this.isDragging) {
            this.updateValueFromPointer(x, y);
        }
    }

    handlePointerUp(): void {
        this.isDragging = false;
    }

    private updateValueFromPointer(x: number, y: number): void {
        let percent: number;
        
        if (this.orientation === 'horizontal') {
            percent = (x - this.x - this.dragOffset) / this.width;
        } else {
            percent = 1 - (y - this.y - this.dragOffset) / this.height;
        }
        
        percent = Math.max(0, Math.min(1, percent));
        const newValue = this.min + percent * (this.max - this.min);
        this.setValue(newValue);
        this.onSlide?.(this.value);
    }

    destroy(): void {
        this.isDragging = false;
    }
}