/**
 * UI Text Element for WooJik Engine
 * Renders text on the canvas
 */

import { UIElement, UIElementConfig } from './UIElement';
import { Color } from '../core/types';

export interface UITextConfig extends UIElementConfig {
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    lineHeight?: number;
    wordWrap?: boolean;
    maxWidth?: number;
}

export class UIText extends UIElement {
    text: string = '';
    fontFamily: string = 'sans-serif';
    fontSize: number = 16;
    fontWeight: string = 'normal';
    fontStyle: string = 'normal';
    textAlign: CanvasTextAlign = 'left';
    textBaseline: CanvasTextBaseline = 'top';
    lineHeight: number = 1.2;
    wordWrap: boolean = false;
    maxWidth: number = 0;

    constructor(config: UITextConfig = {}) {
        super(config);
        if (config.text !== undefined) this.text = config.text;
        if (config.fontFamily) this.fontFamily = config.fontFamily;
        if (config.fontSize) this.fontSize = config.fontSize;
        if (config.fontWeight) this.fontWeight = config.fontWeight;
        if (config.fontStyle) this.fontStyle = config.fontStyle;
        if (config.textAlign) this.textAlign = config.textAlign;
        if (config.textBaseline) this.textBaseline = config.textBaseline;
        if (config.lineHeight) this.lineHeight = config.lineHeight;
        if (config.wordWrap !== undefined) this.wordWrap = config.wordWrap;
        if (config.maxWidth) this.maxWidth = config.maxWidth;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;

        ctx.save();
        
        const alpha = this.opacity;
        const colorStr = `rgba(${Math.floor(this.color.r * 255)}, ${Math.floor(this.color.g * 255)}, ${Math.floor(this.color.b * 255)}, ${alpha})`;
        
        ctx.fillStyle = colorStr;
        ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        
        if (this.wordWrap && this.maxWidth > 0) {
            this.renderWrappedText(ctx, this.text, this.x, this.y, this.maxWidth);
        } else {
            ctx.fillText(this.text, this.x, this.y);
        }
        
        ctx.restore();
    }

    private renderWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number): void {
        const words = text.split(' ');
        let line = '';
        let lineY = y;
        
        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line.length > 0) {
                ctx.fillText(line, x, lineY);
                lineY += this.fontSize * this.lineHeight;
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        
        if (line.length > 0) {
            ctx.fillText(line, x, lineY);
        }
    }

    setText(text: string): void {
        this.text = text;
        this.markDirty();
    }

    setFont(font: string): void {
        this.fontFamily = font;
        this.markDirty();
    }

    setFontSize(size: number): void {
        this.fontSize = size;
        this.markDirty();
    }

    setFontWeight(weight: string): void {
        this.fontWeight = weight;
        this.markDirty();
    }

    setTextAlign(align: CanvasTextAlign): void {
        this.textAlign = align;
        this.markDirty();
    }

    getTextWidth(): number {
        const ctx = this.manager?.getContext();
        if (ctx) {
            const font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
            ctx.font = font;
            return ctx.measureText(this.text).width;
        }
        return 0;
    }
}