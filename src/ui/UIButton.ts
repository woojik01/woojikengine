/**
 * UI Button Element for WooJik Engine
 * Interactive button element
 */

import { UIElement, UIElementConfig } from './UIElement';
import { Color, Vector2 } from '../core/types';
import { UIText } from './UIText';

export type ButtonState = 'normal' | 'hover' | 'pressed' | 'disabled';

export interface UIButtonConfig extends UIElementConfig {
    text?: string;
    normalColor?: Color;
    hoverColor?: Color;
    pressedColor?: Color;
    disabledColor?: Color;
    textColor?: Color;
    cornerRadius?: number;
    onClick?: () => void;
    onHover?: () => void;
    onPress?: () => void;
    onRelease?: () => void;
    disabled?: boolean;
}

export class UIButton extends UIElement {
    text: string = '';
    normalColor: Color = { r: 0.2, g: 0.2, b: 0.2, a: 1 };
    hoverColor: Color = { r: 0.3, g: 0.3, b: 0.3, a: 1 };
    pressedColor: Color = { r: 0.1, g: 0.1, b: 0.1, a: 1 };
    disabledColor: Color = { r: 0.1, g: 0.1, b: 0.1, a: 0.5 };
    textColor: Color = { r: 1, g: 1, b: 1, a: 1 };
    cornerRadius: number = 0;
    
    private state: ButtonState = 'normal';
    private isDisabled: boolean = false;
    private textElement: UIText;
    
    onClick?: () => void;
    onHover?: () => void;
    onPress?: () => void;
    onRelease?: () => void;

    constructor(config: UIButtonConfig = {}) {
        super(config);
        if (config.text) this.text = config.text;
        if (config.normalColor) this.normalColor = config.normalColor;
        if (config.hoverColor) this.hoverColor = config.hoverColor;
        if (config.pressedColor) this.pressedColor = config.pressedColor;
        if (config.disabledColor) this.disabledColor = config.disabledColor;
        if (config.textColor) this.textColor = config.textColor;
        if (config.cornerRadius !== undefined) this.cornerRadius = config.cornerRadius;
        if (config.disabled !== undefined) this.isDisabled = config.disabled;
        if (config.onClick) this.onClick = config.onClick;
        if (config.onHover) this.onHover = config.onHover;
        if (config.onPress) this.onPress = config.onPress;
        if (config.onRelease) this.onRelease = config.onRelease;
        
        this.textElement = new UIText({
            text: this.text,
            color: this.textColor,
            textAlign: 'center',
            textBaseline: 'middle'
        });
        
        this.updateState();
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;

        // Draw background
        ctx.save();
        
        const bgColor = this.getCurrentColor();
        const alpha = this.opacity * bgColor.a;
        const colorStr = `rgba(${Math.floor(bgColor.r * 255)}, ${Math.floor(bgColor.g * 255)}, ${Math.floor(bgColor.b * 255)}, ${alpha})`;
        
        ctx.fillStyle = colorStr;
        
        if (this.cornerRadius > 0) {
            this.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, this.cornerRadius);
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();

        // Draw text
        this.textElement.x = this.x + this.width / 2;
        this.textElement.y = this.y + this.height / 2;
        this.textElement.color = this.textColor;
        this.textElement.opacity = this.opacity;
        this.textElement.render(ctx);
    }

    private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    private getCurrentColor(): Color {
        if (this.isDisabled) return this.disabledColor;
        switch (this.state) {
            case 'hover': return this.hoverColor;
            case 'pressed': return this.pressedColor;
            default: return this.normalColor;
        }
    }

    private updateState(): void {
        if (this.isDisabled) {
            this.state = 'disabled';
            return;
        }
        // State is updated by input system
    }

    setState(state: ButtonState): void {
        if (this.isDisabled && state !== 'disabled') return;
        this.state = state;
        this.markDirty();
    }

    setDisabled(disabled: boolean): void {
        this.isDisabled = disabled;
        this.updateState();
        this.markDirty();
    }

    setText(text: string): void {
        this.text = text;
        this.textElement.setText(text);
        this.markDirty();
    }

    setTextColor(color: Color): void {
        this.textColor = color;
        this.textElement.setColor(color);
        this.markDirty();
    }

    handleClick(): void {
        if (this.isDisabled) return;
        this.onClick?.();
    }

    handleHover(): void {
        if (this.isDisabled) return;
        this.state = 'hover';
        this.onHover?.();
        this.markDirty();
    }

    handlePress(): void {
        if (this.isDisabled) return;
        this.state = 'pressed';
        this.onPress?.();
        this.markDirty();
    }

    handleRelease(): void {
        if (this.isDisabled) return;
        this.state = 'hover';
        this.onRelease?.();
        this.markDirty();
    }

    handleMouseLeave(): void {
        if (this.isDisabled) return;
        this.state = 'normal';
        this.markDirty();
    }

    destroy(): void {
        this.textElement.destroy();
    }
}