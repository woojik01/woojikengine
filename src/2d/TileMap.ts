// TileMap Component
import type { Texture, Vector2 } from '../core/types';

export interface TileSet { name: string; texture: Texture | null; textureName: string; firstId: number; tileCount: number; tileWidth: number; tileHeight: number; spacing: number; margin: number; columns: number; }
export interface TileLayer { name: string; grid: number[][]; visible: boolean; opacity: number; offsetX: number; offsetY: number; }
export interface TileMapOptions { tileWidth: number; tileHeight: number; width: number; height: number; tileSets?: TileSet[]; layers?: TileLayer[]; }

export class TileMap implements IComponent {
  readonly type = 'TileMap';
  tileWidth: number; tileHeight: number; width: number; height: number;
  tileSets: TileSet[] = []; layers: TileLayer[] = []; visibleLayers: number = 0xFFFFFFFF;
  collisionLayer: number[][] | null = null;

  constructor(options: TileMapOptions) {
    this.tileWidth = options.tileWidth; this.tileHeight = options.tileHeight;
    this.width = options.width; this.height = options.height;
    if (options.tileSets) this.tileSets = options.tileSets;
    if (options.layers) this.layers = options.layers; else this.layers = [{
      name: 'default', grid: Array(this.height).fill(null).map(() => Array(this.width).fill(0)), visible: true, opacity: 1, offsetX: 0, offsetY: 0
    }];
  }

  addTileSet(tileSet: TileSet): void { this.tileSets.push(tileSet); }
  addLayer(layer: TileLayer): void { this.layers.push(layer); }
  getTile(layerIndex: number, x: number, y: number): number {
    if (layerIndex < 0 || layerIndex >= this.layers.length) return 0;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    return this.layers[layerIndex].grid[y][x];
  }
  setTile(layerIndex: number, x: number, y: number, tileId: number): void {
    if (layerIndex < 0 || layerIndex >= this.layers.length) return;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.layers[layerIndex].grid[y][x] = tileId;
  }
  getPixelSize(): Vector2 { return { x: this.width * this.tileWidth, y: this.height * this.tileHeight }; }
  setVisibleLayers(layers: number): void { this.visibleLayers = layers; }
  setCollisionLayer(layer: number[][]): void { this.collisionLayer = layer; }
  getCollisionTile(x: number, y: number): number { if (!this.collisionLayer) return 0; if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0; return this.collisionLayer[y][x]; }
  getTileWorldPosition(x: number, y: number): Vector2 { return { x: x * this.tileWidth, y: y * this.tileHeight }; }
  getTileIndexFromWorld(worldX: number, worldY: number): Vector2 { return { x: Math.floor(worldX / this.tileWidth), y: Math.floor(worldY / this.tileHeight) }; }
  serialize(): any {
    return {
      tileWidth: this.tileWidth, tileHeight: this.tileHeight, width: this.width, height: this.height,
      tileSets: this.tileSets.map(ts => ({ name: ts.name, textureName: ts.textureName, firstId: ts.firstId, tileCount: ts.tileCount, tileWidth: ts.tileWidth, tileHeight: ts.tileHeight, spacing: ts.spacing, margin: ts.margin })),
      layers: this.layers.map(layer => ({ name: layer.name, grid: layer.grid, visible: layer.visible, opacity: layer.opacity, offsetX: layer.offsetX, offsetY: layer.offsetY })),
      collisionLayer: this.collisionLayer
    };
  }
  static deserialize(data: any): TileMap {
    const options: TileMapOptions = { tileWidth: data.tileWidth, tileHeight: data.tileHeight, width: data.width, height: data.height };
    const tileMap = new TileMap(options);
    tileMap.tileSets = data.tileSets.map((ts: any) => ({ name: ts.name, texture: null, textureName: ts.textureName, firstId: ts.firstId, tileCount: ts.tileCount, tileWidth: ts.tileWidth, tileHeight: ts.tileHeight, spacing: ts.spacing || 0, margin: ts.margin || 0, columns: Math.floor((ts.tileWidth || 32) / (ts.tileWidth || 32)) }));
    tileMap.layers = data.layers.map((layer: any) => ({ name: layer.name, grid: layer.grid, visible: layer.visible !== false, opacity: layer.opacity || 1, offsetX: layer.offsetX || 0, offsetY: layer.offsetY || 0 }));
    if (data.collisionLayer) tileMap.collisionLayer = data.collisionLayer;
    return tileMap;
  }
}