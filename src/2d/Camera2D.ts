// Camera2D
import type { Vector2, Rectangle } from '../core/types';
import type { CameraType } from '../core/types';

export interface CameraTransform { x: number; y: number; zoom: number; rotation: number; }
export interface Camera2DOptions { x?: number; y?: number; zoom?: number; rotation?: number; type?: CameraType; followTarget?: Vector2 | null; followSmoothness?: number; bounds?: Rectangle | null; }

export class Camera2D {
  private x: number = 0; private y: number = 0; private zoom: number = 1; private rotation: number = 0;
  private type: CameraType = 'static'; private followTarget: Vector2 | null = null; private followSmoothness: number = 0.1;
  private bounds: Rectangle | null = null; private viewportWidth: number = 800; private viewportHeight: number = 600;
  private dirty: boolean = true;

  constructor(options: Camera2DOptions = {}) {
    this.x = options.x || 0; this.y = options.y || 0; this.zoom = options.zoom || 1; this.rotation = options.rotation || 0;
    this.type = options.type || 'static'; this.followTarget = options.followTarget || null; this.followSmoothness = options.followSmoothness || 0.1; this.bounds = options.bounds || null;
  }

  setViewport(width: number, height: number): void { this.viewportWidth = width; this.viewportHeight = height; this.dirty = true; }
  setType(type: CameraType): void { this.type = type; }
  setFollowTarget(target: Vector2 | null): void { this.followTarget = target; }
  setFollowSmoothness(smoothness: number): void { this.followSmoothness = Math.max(0, Math.min(1, smoothness)); }
  setBounds(bounds: Rectangle | null): void { this.bounds = bounds; }
  setPosition(x: number, y: number): void { this.x = x; this.y = y; this.dirty = true; }
  getPosition(): Vector2 { return { x: this.x, y: this.y }; }
  setZoom(zoom: number): void { this.zoom = Math.max(0.01, Math.min(100, zoom)); this.dirty = true; }
  getZoom(): number { return this.zoom; }
  setRotation(rotation: number): void { this.rotation = rotation; this.dirty = true; }
  getRotation(): number { return this.rotation; }
  getTransform(): CameraTransform { return { x: this.x, y: this.y, zoom: this.zoom, rotation: this.rotation }; }
  getViewRect(): Rectangle {
    const halfWidth = this.viewportWidth / 2 / this.zoom; const halfHeight = this.viewportHeight / 2 / this.zoom;
    return { x: this.x - halfWidth, y: this.y - halfHeight, width: this.viewportWidth / this.zoom, height: this.viewportHeight / this.zoom };
  }
  worldToScreen(worldX: number, worldY: number): Vector2 {
    const screenX = (worldX - this.x) * this.zoom * Math.cos(this.rotation) - (worldY - this.y) * this.zoom * Math.sin(this.rotation) + this.viewportWidth / 2;
    const screenY = (worldX - this.x) * this.zoom * Math.sin(this.rotation) + (worldY - this.y) * this.zoom * Math.cos(this.rotation) + this.viewportHeight / 2;
    return { x: screenX, y: screenY };
  }
  screenToWorld(screenX: number, screenY: number): Vector2 {
    const worldX = (screenX - this.viewportWidth / 2) / this.zoom * Math.cos(-this.rotation) - (screenY - this.viewportHeight / 2) / this.zoom * Math.sin(-this.rotation) + this.x;
    const worldY = (screenX - this.viewportWidth / 2) / this.zoom * Math.sin(-this.rotation) + (screenY - this.viewportHeight / 2) / this.zoom * Math.cos(-this.rotation) + this.y;
    return { x: worldX, y: worldY };
  }
  update(deltaTime: number): void {
    if (this.type === 'follow' && this.followTarget) {
      const targetX = this.followTarget.x; const targetY = this.followTarget.y;
      this.x += (targetX - this.x) * this.followSmoothness; this.y += (targetY - this.y) * this.followSmoothness; this.dirty = true;
    }
    if (this.bounds) {
      const halfWidth = this.viewportWidth / 2 / this.zoom; const halfHeight = this.viewportHeight / 2 / this.zoom;
      this.x = Math.max(this.bounds.x + halfWidth, Math.min(this.bounds.x + this.bounds.width - halfWidth, this.x));
      this.y = Math.max(this.bounds.y + halfHeight, Math.min(this.bounds.y + this.bounds.height - halfHeight, this.y));
    }
  }
  reset(): void { this.x = 0; this.y = 0; this.zoom = 1; this.rotation = 0; this.dirty = true; }
}