// Sprite Component
import type { Texture, SpriteFrame, Color, BlendMode } from '../core/types';

export type SpriteBlendMode = BlendMode;
export interface SpriteFlip { flipX: boolean; flipY: boolean; }

export class Sprite implements IComponent {
  readonly type = 'Sprite';
  texture: Texture | null = null;
  textureName: string = '';
  frame: SpriteFrame = { x: 0, y: 0, width: 32, height: 32 };
  tint: Color = { r: 1, g: 1, b: 1, a: 1 };
  blendMode: SpriteBlendMode = 'normal';
  flip: SpriteFlip = { flipX: false, flipY: false };
  pivotX: number = 0.5; pivotY: number = 0.5;
  layer: number = 0; zIndex: number = 0;
  visible: boolean = true;

  constructor(textureName: string = '', frame: SpriteFrame = { x: 0, y: 0, width: 32, height: 32 }) {
    this.textureName = textureName; this.frame = frame;
  }

  setTexture(texture: Texture): void { this.texture = texture; }
  setFrame(frame: SpriteFrame): void { this.frame = frame; }
  setTint(color: Color): void { this.tint = color; }
  setBlendMode(mode: SpriteBlendMode): void { this.blendMode = mode; }
  setFlip(flipX: boolean, flipY: boolean): void { this.flip.flipX = flipX; this.flip.flipY = flipY; }
  setPivot(pivotX: number, pivotY: number): void { this.pivotX = pivotX; this.pivotY = pivotY; }
  setLayer(layer: number): void { this.layer = layer; }
  setZIndex(zIndex: number): void { this.zIndex = zIndex; }
  setVisible(visible: boolean): void { this.visible = visible; }
  get width(): number { return this.frame.width; }
  get height(): number { return this.frame.height; }
}

export class SpriteSheet {
  texture: Texture | null = null;
  textureName: string;
  frameWidth: number; frameHeight: number;
  spacing: number = 0; margin: number = 0;

  constructor(textureName: string, frameWidth: number, frameHeight: number, spacing: number = 0, margin: number = 0) {
    this.textureName = textureName; this.frameWidth = frameWidth; this.frameHeight = frameHeight;
    this.spacing = spacing; this.margin = margin;
  }

  getFrame(index: number): SpriteFrame {
    const framesPerRow = Math.floor((this.texture?.width || 0 - this.margin * 2 + this.spacing) / (this.frameWidth + this.spacing));
    const row = Math.floor(index / framesPerRow); const col = index % framesPerRow;
    return { x: this.margin + col * (this.frameWidth + this.spacing), y: this.margin + row * (this.frameHeight + this.spacing), width: this.frameWidth, height: this.frameHeight };
  }

  getFrameCount(): number {
    if (!this.texture) return 0;
    const framesPerRow = Math.floor((this.texture.width - this.margin * 2 + this.spacing) / (this.frameWidth + this.spacing));
    const framesPerCol = Math.floor((this.texture.height - this.margin * 2 + this.spacing) / (this.frameHeight + this.spacing));
    return framesPerRow * framesPerCol;
  }
}

export class SpriteAnimation {
  name: string; frames: SpriteFrame[]; frameDurations: number[]; loop: boolean = true;
  private currentFrame: number = 0; private elapsedTime: number = 0; private isPlaying: boolean = false;

  constructor(name: string, frames: SpriteFrame[], frameDurations: number[], loop: boolean = true) {
    this.name = name; this.frames = frames; this.frameDurations = frameDurations; this.loop = loop;
  }

  play(): void { this.isPlaying = true; this.currentFrame = 0; this.elapsedTime = 0; }
  pause(): void { this.isPlaying = false; }
  resume(): void { this.isPlaying = true; }
  stop(): void { this.isPlaying = false; this.currentFrame = 0; this.elapsedTime = 0; }

  update(deltaTime: number): SpriteFrame | null {
    if (!this.isPlaying) return null;
    this.elapsedTime += deltaTime * 1000;
    const duration = this.frameDurations[this.currentFrame] || 100;
    if (this.elapsedTime >= duration) {
      this.elapsedTime = 0; this.currentFrame++;
      if (this.currentFrame >= this.frames.length) {
        if (this.loop) this.currentFrame = 0; else { this.isPlaying = false; this.currentFrame = this.frames.length - 1; }
      }
    }
    return this.frames[this.currentFrame];
  }

  getCurrentFrame(): SpriteFrame { return this.frames[this.currentFrame]; }
  isPlaying(): boolean { return this.isPlaying; }
  isComplete(): boolean { return !this.isPlaying && this.currentFrame >= this.frames.length - 1; }
}