// Woojik Engine Core
import { ECSWorld } from './ECS';
import { Renderer2D } from '../2d/Renderer2D';
import { Renderer3D } from '../3d/Renderer3D';
import { InputManager } from '../input/InputManager';
import { AudioManager } from '../audio/AudioManager';
import { AssetManager } from '../assets/AssetManager';
import { SceneManager } from '../scene/SceneManager';
import type { Vector2 } from './types';

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  clearColor?: string;
  debug?: boolean;
  targetFPS?: number;
}

export interface EngineStats {
  fps: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  frameTime: number;
  memory: { used: number; total: number };
  render: { drawCalls2D: number; drawCalls3D: number; triangles: number; textures: number; };
}

export class Engine {
  private static instance: Engine | null = null;
  public readonly ecs: ECSWorld;
  public readonly renderer2D: Renderer2D;
  public readonly renderer3D: Renderer3D;
  public readonly input: InputManager;
  public readonly audio: AudioManager;
  public readonly assets: AssetManager;
  public readonly scene: SceneManager;
  private canvas: HTMLCanvasElement;
  private context2D: CanvasRenderingContext2D | null = null;
  private glContext: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  private width: number;
  private height: number;
  private clearColor: string = '#000000';
  private debug: boolean = false;
  private targetFPS: number = 60;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;
  private fpsHistory: number[] = [];
  private requestId: number = 0;

  public stats: EngineStats = {
    fps: 0, averageFps: 0, minFps: Infinity, maxFps: 0, frameTime: 0,
    memory: { used: 0, total: 0 },
    render: { drawCalls2D: 0, drawCalls3D: 0, triangles: 0, textures: 0 }
  };

  private constructor(options: EngineOptions) {
    this.canvas = options.canvas;
    this.width = options.width || this.canvas.width;
    this.height = options.height || this.canvas.height;
    if (options.clearColor) this.clearColor = options.clearColor;
    if (options.debug) this.debug = options.debug;
    if (options.targetFPS) this.targetFPS = options.targetFPS;
    this.ecs = new ECSWorld();
    this.input = new InputManager(this.canvas);
    this.audio = new AudioManager();
    this.assets = new AssetManager();
    this.scene = new SceneManager(this.ecs, this.assets);
    this.renderer2D = new Renderer2D(this.canvas, this.width, this.height);
    this.renderer3D = new Renderer3D(this.canvas, this.width, this.height);
    this.resizeCanvas();
    window.addEventListener('resize', () => this.handleResize());
  }

  public static getInstance(): Engine {
    if (!Engine.instance) throw new Error('Engine not initialized. Call Engine.initialize(options) first.');
    return Engine.instance;
  }

  public static initialize(options: EngineOptions): Engine {
    if (Engine.instance) { console.warn('Engine already initialized.'); return Engine.instance; }
    Engine.instance = new Engine(options);
    return Engine.instance;
  }

  private resizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.context2D = this.canvas.getContext('2d', { alpha: true });
    if (this.context2D) this.context2D.scale(dpr, dpr);
    try {
      this.glContext = this.canvas.getContext('webgl2') || this.canvas.getContext('experimental-webgl2') || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    } catch (e) { console.warn('WebGL not supported:', e); this.glContext = null; }
    this.renderer2D.setContext(this.context2D);
    this.renderer3D.setContext(this.glContext);
  }

  private handleResize(): void { this.resizeCanvas(); }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public pause(): void { this.isRunning = false; if (this.requestId) { cancelAnimationFrame(this.requestId); this.requestId = 0; } }
  public resume(): void { if (this.isRunning) return; this.isRunning = true; this.lastTime = performance.now(); this.gameLoop(); }
  public stop(): void { this.isRunning = false; if (this.requestId) { cancelAnimationFrame(this.requestId); this.requestId = 0; } }

  private gameLoop(currentTime: number = 0): void {
    if (!this.isRunning) return;
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.frameCount++;
    const elapsed = currentTime - this.lastTime;
    if (elapsed >= 1000) {
      this.fps = this.frameCount; this.frameCount = 0; this.lastTime = currentTime;
      this.fpsHistory.push(this.fps);
      if (this.fpsHistory.length > 60) this.fpsHistory.shift();
      this.updateStats();
    }
    this.input.update();
    this.scene.update(deltaTime);
    this.ecs.update(deltaTime);
    this.render();
    if (this.debug) this.drawDebugInfo();
    this.requestId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private render(): void {
    if (this.context2D) {
      this.context2D.clearRect(0, 0, this.width, this.height);
      this.context2D.fillStyle = this.clearColor;
      this.context2D.fillRect(0, 0, this.width, this.height);
      this.renderer2D.render(this.ecs);
    }
    if (this.glContext) this.renderer3D.render(this.ecs);
  }

  private drawDebugInfo(): void {
    if (!this.context2D) return;
    const debugInfo = [
      'FPS: ' + this.stats.fps,
      'Avg FPS: ' + this.stats.averageFps.toFixed(1),
      'Min/Max: ' + (this.stats.minFps === Infinity ? '0' : this.stats.minFps) + '/' + this.stats.maxFps,
      'Draw Calls (2D): ' + this.stats.render.drawCalls2D,
      'Draw Calls (3D): ' + this.stats.render.drawCalls3D,
      'Memory: ' + (this.stats.memory.used / 1024 / 1024).toFixed(2) + 'MB',
      'Entities: ' + this.ecs.getEntityCount()
    ];
    this.context2D.font = '12px monospace';
    this.context2D.fillStyle = '#ffffff';
    this.context2D.textAlign = 'left';
    debugInfo.forEach((line, index) => { this.context2D.fillText(line, 10, 20 + index * 15); });
  }

  private updateStats(): void {
    this.stats.fps = this.fps;
    if (this.fpsHistory.length > 0) this.stats.averageFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    this.stats.minFps = Math.min(this.stats.minFps, this.fps);
    this.stats.maxFps = Math.max(this.stats.maxFps, this.fps);
    if (window.performance && (window.performance as any).memory) {
      this.stats.memory.used = (window.performance as any).memory.usedJSHeapSize;
      this.stats.memory.total = (window.performance as any).memory.totalJSHeapSize;
    }
    this.stats.render.drawCalls2D = this.renderer2D.getDrawCallCount();
    this.stats.render.drawCalls3D = this.renderer3D.getDrawCallCount();
  }

  public destroy(): void {
    this.stop();
    this.renderer2D.destroy(); this.renderer3D.destroy();
    this.input.destroy(); this.audio.destroy(); this.assets.destroy(); this.scene.destroy();
    window.removeEventListener('resize', () => this.handleResize());
    Engine.instance = null;
  }

  public getCanvas(): HTMLCanvasElement { return this.canvas; }
  public getContext2D(): CanvasRenderingContext2D | null { return this.context2D; }
  public getGLContext(): WebGL2RenderingContext | WebGLRenderingContext | null { return this.glContext; }
  public getSize(): Vector2 { return { x: this.width, y: this.height }; }
  public setSize(width: number, height: number): void { this.width = width; this.height = height; this.resizeCanvas(); }
  public setDebug(debug: boolean): void { this.debug = debug; }
  public setTargetFPS(fps: number): void { this.targetFPS = fps; }
  public setClearColor(color: string): void { this.clearColor = color; }
}

export default Engine;