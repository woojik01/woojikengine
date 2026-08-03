// Particle System
import type { Texture, Vector2, Color } from '../core/types';

export interface Particle { x: number; y: number; px: number; py: number; velocityX: number; velocityY: number; accelerationX: number; accelerationY: number; size: number; rotation: number; rotationSpeed: number; tint: Color; life: number; maxLife: number; texture: Texture | null; blendMode: 'normal' | 'additive'; scaleOverTime: Vector2; alphaOverTime: Vector2; gravityScale: number; }

export type EmitterType = 'point' | 'line' | 'circle' | 'rectangle';
export interface ParticleEmitterOptions { type?: EmitterType; rate?: number; burstCount?: number; maxParticles?: number; duration?: number; loop?: boolean; }

export class ParticleSystem implements IComponent {
  readonly type = 'ParticleSystem';
  private particlePool: Particle[] = []; private activeParticles: Particle[] = [];
  private emitterType: EmitterType = 'point'; private emissionRate: number = 10; private burstCount: number = 1; private maxParticles: number = 100;
  private emitterDuration: number = 0; private loop: boolean = true; private isEmitting: boolean = true; private elapsedTime: number = 0; private emittedCount: number = 0;
  private particleTexture: Texture | null = null; private particleTextureName: string = '';
  private particleLife: Vector2 = { x: 1000, y: 1000 }; private particleSize: Vector2 = { x: 16, y: 16 };
  private particleSpeed: Vector2 = { x: 50, y: 100 }; private particleRotation: Vector2 = { x: 0, y: 0 };
  private particleRotationSpeed: Vector2 = { x: 0, y: 0 }; private particleGravityScale: Vector2 = { x: 0, y: 1 };
  private particleBlendMode: 'normal' | 'additive' = 'normal'; private particleAlpha: Vector2 = { x: 1, y: 1 };
  private emitterX: number = 0; private emitterY: number = 0; private emitterWidth: number = 0; private emitterHeight: number = 0; private emitterRadius: number = 0;
  private visible: boolean = true;

  constructor(options: ParticleEmitterOptions = {}) {
    this.emitterType = options.type || 'point'; this.emissionRate = options.rate || 10; this.burstCount = options.burstCount || 1;
    this.maxParticles = options.maxParticles || 100; this.emitterDuration = options.duration || 0; this.loop = options.loop !== false;
    for (let i = 0; i < this.maxParticles; i++) this.particlePool.push(this.createParticle());
  }

  private createParticle(): Particle {
    return { x: 0, y: 0, px: 0, py: 0, velocityX: 0, velocityY: 0, accelerationX: 0, accelerationY: 0, size: 16, rotation: 0, rotationSpeed: 0, tint: { r: 1, g: 1, b: 1, a: 1 }, life: 1000, maxLife: 1000, texture: null, blendMode: 'normal', scaleOverTime: { x: 1, y: 1 }, alphaOverTime: { x: 1, y: 1 }, gravityScale: 1 };
  }

  setTexture(texture: Texture): void { this.particleTexture = texture; this.particleTextureName = texture.image.src || ''; }
  setTextureName(name: string): void { this.particleTextureName = name; }
  setParticleLife(min: number, max: number): void { this.particleLife = { x: min, y: max }; }
  setParticleSize(min: number, max: number): void { this.particleSize = { x: min, y: max }; }
  setParticleSpeed(min: number, max: number): void { this.particleSpeed = { x: min, y: max }; }
  setParticleRotation(min: number, max: number): void { this.particleRotation = { x: min, y: max }; }
  setParticleRotationSpeed(min: number, max: number): void { this.particleRotationSpeed = { x: min, y: max }; }
  setParticleGravityScale(min: number, max: number): void { this.particleGravityScale = { x: min, y: max }; }
  setBlendMode(mode: 'normal' | 'additive'): void { this.particleBlendMode = mode; }
  setEmitterType(type: EmitterType): void { this.emitterType = type; }
  setEmissionRate(rate: number): void { this.emissionRate = rate; }
  setBurstCount(count: number): void { this.burstCount = count; }
  setMaxParticles(max: number): void { this.maxParticles = max; while (this.particlePool.length < max) this.particlePool.push(this.createParticle()); this.particlePool = this.particlePool.slice(0, max); }
  setEmitterPosition(x: number, y: number): void { this.emitterX = x; this.emitterY = y; }
  setEmitterSize(width: number, height: number): void { this.emitterWidth = width; this.emitterHeight = height; }
  setEmitterRadius(radius: number): void { this.emitterRadius = radius; }
  setVisible(visible: boolean): void { this.visible = visible; }
  start(): void { this.isEmitting = true; this.elapsedTime = 0; this.emittedCount = 0; }
  pause(): void { this.isEmitting = false; }
  resume(): void { this.isEmitting = true; }
  stop(): void { this.isEmitting = false; this.elapsedTime = 0; this.emittedCount = 0; for (const particle of this.activeParticles) this.particlePool.push(particle); this.activeParticles = []; }

  update(deltaTime: number, worldPosition: Vector2 = { x: 0, y: 0 }): void {
    if (!this.isEmitting && this.emitterDuration === 0 && this.activeParticles.length === 0) return;
    this.elapsedTime += deltaTime * 1000;
    if (this.emitterDuration > 0 && this.elapsedTime >= this.emitterDuration) {
      if (this.loop) { this.elapsedTime = 0; this.emittedCount = 0; } else this.isEmitting = false;
    }
    if (this.isEmitting) {
      const particlesToEmit = Math.floor(this.emissionRate * deltaTime);
      for (let i = 0; i < particlesToEmit && this.activeParticles.length < this.maxParticles; i++) this.emitParticle(worldPosition);
    }
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i]; particle.life -= deltaTime * 1000;
      if (particle.life <= 0) { this.particlePool.push(particle); this.activeParticles.splice(i, 1); continue; }
      particle.velocityX += particle.accelerationX * deltaTime; particle.velocityY += particle.accelerationY * deltaTime;
      particle.px += particle.velocityX * deltaTime; particle.py += particle.velocityY * deltaTime;
      particle.rotation += particle.rotationSpeed * deltaTime;
      const lifeRatio = particle.life / particle.maxLife;
      particle.size = this.lerp(this.particleSize.x, this.particleSize.y, 1 - lifeRatio);
      particle.tint.a = this.lerp(this.particleAlpha.x, this.particleAlpha.y, 1 - lifeRatio);
    }
  }

  private emitParticle(worldPosition: Vector2): void {
    if (this.particlePool.length === 0) return; const particle = this.particlePool.pop()!;
    particle.life = this.randomRange(this.particleLife.x, this.particleLife.y); particle.maxLife = particle.life;
    particle.size = this.randomRange(this.particleSize.x, this.particleSize.y);
    particle.rotation = this.randomRange(this.particleRotation.x, this.particleRotation.y);
    particle.rotationSpeed = this.randomRange(this.particleRotationSpeed.x, this.particleRotationSpeed.y);
    particle.gravityScale = this.randomRange(this.particleGravityScale.x, this.particleGravityScale.y);
    particle.blendMode = this.particleBlendMode; particle.texture = this.particleTexture;
    const angle = Math.random() * Math.PI * 2; const speed = this.randomRange(this.particleSpeed.x, this.particleSpeed.y);
    particle.velocityX = Math.cos(angle) * speed; particle.velocityY = Math.sin(angle) * speed;
    switch (this.emitterType) {
      case 'point': particle.x = 0; particle.y = 0; break;
      case 'line': particle.x = this.randomRange(-this.emitterWidth / 2, this.emitterWidth / 2); particle.y = 0; break;
      case 'circle': const radius = this.emitterRadius || this.emitterWidth / 2; const angle2 = Math.random() * Math.PI * 2; const distance = Math.random() * radius; particle.x = Math.cos(angle2) * distance; particle.y = Math.sin(angle2) * distance; break;
      case 'rectangle': particle.x = this.randomRange(-this.emitterWidth / 2, this.emitterWidth / 2); particle.y = this.randomRange(-this.emitterHeight / 2, this.emitterHeight / 2); break;
    }
    particle.px = worldPosition.x + this.emitterX + particle.x; particle.py = worldPosition.y + this.emitterY + particle.y;
    particle.alphaOverTime = { x: 1, y: 0 }; this.activeParticles.push(particle); this.emittedCount++;
  }

  getActiveParticles(): Particle[] { return this.activeParticles; }
  getActiveParticleCount(): number { return this.activeParticles.length; }
  getTotalParticleCount(): number { return this.activeParticles.length + this.particlePool.length; }
  isEmitting(): boolean { return this.isEmitting; }
  isComplete(): boolean { return !this.isEmitting && this.activeParticles.length === 0; }
  setParticleAlpha(min: number, max: number): void { this.particleAlpha = { x: min, y: max }; }
  private randomRange(min: number, max: number): number { return min + Math.random() * (max - min); }
  private lerp(start: number, end: number, t: number): number { return start + (end - start) * t; }
}