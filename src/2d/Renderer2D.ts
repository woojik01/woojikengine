// 2D Renderer
import { ECSWorld } from '../core/ECS';
import { Sprite } from './Sprite';
import { Camera2D } from './Camera2D';
import { ParticleSystem } from './ParticleSystem';
import { TileMap } from './TileMap';
import type { Transform2D, Color, Vector2 } from '../core/types';

export interface Renderer2DOptions { canvas: HTMLCanvasElement; width: number; height: number; batchSize?: number; }

export class Renderer2D {
  private canvas: HTMLCanvasElement; private context: CanvasRenderingContext2D | null = null;
  private width: number; private height: number; private batchSize: number;
  private camera: Camera2D | null = null; private spriteBatch: SpriteBatch;
  private debug: boolean = false; private drawCallCount: number = 0;

  constructor(canvas: HTMLCanvasElement, width: number, height: number, batchSize: number = 1000) {
    this.canvas = canvas; this.width = width; this.height = height; this.batchSize = batchSize;
    this.spriteBatch = new SpriteBatch(batchSize);
  }

  setContext(context: CanvasRenderingContext2D | null): void { this.context = context; this.spriteBatch.setContext(context); }
  setCamera(camera: Camera2D): void { this.camera = camera; }
  setDebug(debug: boolean): void { this.debug = debug; }

  render(world: ECSWorld): void {
    if (!this.context || !this.camera) return; this.drawCallCount = 0;
    this.context.save(); this.applyCameraTransform();
    const entities = world.getAllEntities();
    const sortedEntities = Array.from(entities.values()).filter(e => e.isActive())
      .sort((a, b) => { const aZ = a.getComponent('Sprite')?.zIndex || 0; const bZ = b.getComponent('Sprite')?.zIndex || 0; return aZ - bZ; });
    this.spriteBatch.begin();
    for (const entity of sortedEntities) {
      const transform = entity.getComponent('Transform2D'); const sprite = entity.getComponent('Sprite');
      const tileMap = entity.getComponent('TileMap'); const particles = entity.getComponent('ParticleSystem');
      if (!transform) continue;
      if (sprite && sprite.visible) this.renderSprite(entity, transform, sprite);
      if (tileMap) this.renderTileMap(entity, transform, tileMap);
      if (particles) this.renderParticles(entity, transform, particles);
    }
    this.spriteBatch.flush(); this.context.restore();
    if (this.debug) this.drawDebugInfo();
  }

  private applyCameraTransform(): void {
    if (!this.context || !this.camera) return;
    const { x, y, zoom, rotation } = this.camera.getTransform();
    this.context.translate(this.width / 2, this.height / 2);
    this.context.rotate(rotation); this.context.scale(zoom, zoom);
    this.context.translate(-this.width / 2 + x, -this.height / 2 + y);
  }

  private renderSprite(entity: any, transform: Transform2D, sprite: Sprite): void {
    if (!this.context || !sprite.texture?.loaded) return;
    const { x, y, rotation, scaleX, scaleY, pivotX = 0.5, pivotY = 0.5 } = transform;
    const { frame, tint, blendMode, flip, layer, zIndex } = sprite;
    this.spriteBatch.addSprite({
      texture: sprite.texture!, x: x - frame.width * pivotX * scaleX, y: y - frame.height * pivotY * scaleY,
      width: frame.width * scaleX, height: frame.height * scaleY,
      srcX: frame.x, srcY: frame.y, srcWidth: frame.width, srcHeight: frame.height,
      rotation, pivotX, pivotY, tint, blendMode, flipX: flip.flipX, flipY: flip.flipY, layer, zIndex
    });
  }

  private renderTileMap(entity: any, transform: Transform2D, tileMap: TileMap): void {
    if (!this.context) return; const { x, y } = transform;
    if (!this.camera) return; const cameraRect = this.camera.getViewRect();
    const tileWidth = tileMap.tileWidth; const tileHeight = tileMap.tileHeight;
    const grid = tileMap.layers[0]?.grid || [];
    const startCol = Math.max(0, Math.floor((cameraRect.x - x) / tileWidth));
    const endCol = Math.min(grid[0]?.length || 0, Math.ceil((cameraRect.x + cameraRect.width - x) / tileWidth));
    const startRow = Math.max(0, Math.floor((cameraRect.y - y) / tileHeight));
    const endRow = Math.min(grid.length, Math.ceil((cameraRect.y + cameraRect.height - y) / tileHeight));
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tileId = grid[row]?.[col]; if (tileId === 0) continue;
        const tileSet = tileMap.tileSets.find(ts => tileId >= ts.firstId && tileId < ts.firstId + ts.tileCount);
        if (!tileSet || !tileSet.texture?.loaded) continue;
        const tileX = (tileId - tileSet.firstId) % tileSet.columns;
        const tileY = Math.floor((tileId - tileSet.firstId) / tileSet.columns);
        const srcX = tileX * tileWidth + tileSet.margin; const srcY = tileY * tileHeight + tileSet.margin;
        this.context.drawImage(tileSet.texture.image, srcX, srcY, tileWidth, tileHeight, x + col * tileWidth, y + row * tileHeight, tileWidth, tileHeight);
        this.drawCallCount++;
      }
    }
  }

  private renderParticles(entity: any, transform: Transform2D, particles: ParticleSystem): void {
    if (!this.context) return; const { x, y } = transform; const activeParticles = particles.getActiveParticles();
    for (const particle of activeParticles) {
      if (!particle.texture?.loaded) continue;
      this.context.save(); this.context.globalAlpha = particle.tint.a;
      this.context.translate(x + particle.px, y + particle.py); this.context.rotate(particle.rotation);
      if (particle.blendMode === 'additive') this.context.globalCompositeOperation = 'lighter';
      else if (particle.blendMode === 'multiply') this.context.globalCompositeOperation = 'multiply';
      else this.context.globalCompositeOperation = 'source-over';
      this.context.drawImage(particle.texture.image, 0, 0, particle.texture.width, particle.texture.height, -particle.size / 2, -particle.size / 2, particle.size, particle.size);
      this.context.restore(); this.drawCallCount++;
    }
  }

  private drawDebugInfo(): void {
    if (!this.context) return; this.context.save(); this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.font = '12px monospace'; this.context.fillStyle = '#ff0000';
    this.context.fillText('Draw Calls: ' + this.drawCallCount, 10, 30); this.context.restore();
  }

  getDrawCallCount(): number { return this.drawCallCount; }
  destroy(): void { this.spriteBatch.destroy(); this.context = null; }
}

class SpriteBatch {
  private context: CanvasRenderingContext2D | null = null; private sprites: any[] = []; private batchSize: number;
  private currentTexture: any | null = null;
  constructor(batchSize: number) { this.batchSize = batchSize; }
  setContext(context: CanvasRenderingContext2D | null): void { this.context = context; }
  begin(): void { this.sprites = []; this.currentTexture = null; }
  addSprite(item: any): void {
    if (this.currentTexture !== item.texture) { this.flush(); this.currentTexture = item.texture; }
    this.sprites.push(item); if (this.sprites.length >= this.batchSize) this.flush();
  }
  flush(): void {
    if (!this.context || this.sprites.length === 0) return; const texture = this.currentTexture;
    if (!texture?.loaded) return; for (const sprite of this.sprites) this.drawSprite(sprite); this.sprites = [];
  }
  private drawSprite(item: any): void {
    if (!this.context) return; const { texture, x, y, width, height, srcX, srcY, srcWidth, srcHeight, rotation, pivotX, pivotY, tint, blendMode, flipX, flipY } = item;
    this.context.save(); this.context.translate(x + width * pivotX, y + height * pivotY); this.context.rotate(rotation);
    if (flipX) this.context.scale(-1, 1); if (flipY) this.context.scale(1, -1);
    if (blendMode === 'additive') this.context.globalCompositeOperation = 'lighter';
    else if (blendMode === 'multiply') this.context.globalCompositeOperation = 'multiply';
    else this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = tint.a; this.context.fillStyle = 'rgba(' + Math.floor(tint.r * 255) + ',' + Math.floor(tint.g * 255) + ',' + Math.floor(tint.b * 255) + ',1)';
    this.context.beginPath(); this.context.rect(-width * pivotX, -height * pivotY, width, height); this.context.clip();
    this.context.drawImage(texture.image, srcX, srcY, srcWidth, srcHeight, -width * pivotX, -height * pivotY, width, height);
    this.context.fillStyle = 'rgba(' + Math.floor(tint.r * 255) + ',' + Math.floor(tint.g * 255) + ',' + Math.floor(tint.b * 255) + ',' + tint.a + ')';
    this.context.fillRect(-width * pivotX, -height * pivotY, width, height); this.context.restore();
  }
  destroy(): void { this.sprites = []; this.currentTexture = null; }
}