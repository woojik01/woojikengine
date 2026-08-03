// Material Component
import type { Color, Texture } from '../core/types';

export type MaterialType = 'basic' | 'unlit' | 'pbr';
export interface MaterialOptions { type?: MaterialType; diffuseColor?: Color; diffuseMap?: Texture | null; normalMap?: Texture | null; specularMap?: Texture | null; emissiveMap?: Texture | null; shininess?: number; opacity?: number; doubleSided?: boolean; }

export class Material implements IComponent {
  readonly type = 'Material';
  materialType: MaterialType = 'basic';
  diffuseColor: Color = { r: 1, g: 1, b: 1, a: 1 }; specularColor: Color = { r: 1, g: 1, b: 1, a: 1 }; emissiveColor: Color = { r: 0, g: 0, b: 0, a: 1 };
  diffuseMap: Texture | null = null; normalMap: Texture | null = null; specularMap: Texture | null = null; emissiveMap: Texture | null = null;
  shininess: number = 32; opacity: number = 1.0; doubleSided: boolean = false;

  constructor(options: MaterialOptions = {}) {
    if (options.type) this.materialType = options.type; if (options.diffuseColor) this.diffuseColor = options.diffuseColor;
    if (options.diffuseMap) this.diffuseMap = options.diffuseMap; if (options.normalMap) this.normalMap = options.normalMap;
    if (options.specularMap) this.specularMap = options.specularMap; if (options.emissiveMap) this.emissiveMap = options.emissiveMap;
    if (options.shininess) this.shininess = options.shininess; if (options.opacity) this.opacity = options.opacity;
    if (options.doubleSided) this.doubleSided = options.doubleSided;
  }

  setDiffuseColor(color: Color): void { this.diffuseColor = color; }
  setDiffuseMap(texture: Texture | null): void { this.diffuseMap = texture; }
  setNormalMap(texture: Texture | null): void { this.normalMap = texture; }
  setSpecularMap(texture: Texture | null): void { this.specularMap = texture; }
  setEmissiveMap(texture: Texture | null): void { this.emissiveMap = texture; }
  setShininess(shininess: number): void { this.shininess = Math.max(0, shininess); }
  setOpacity(opacity: number): void { this.opacity = Math.max(0, Math.min(1, opacity)); }
  setDoubleSided(doubleSided: boolean): void { this.doubleSided = doubleSided; }
  setType(type: MaterialType): void { this.materialType = type; }
  clone(): Material {
    return new Material({ type: this.materialType, diffuseColor: { ...this.diffuseColor }, diffuseMap: this.diffuseMap, normalMap: this.normalMap, specularMap: this.specularMap, emissiveMap: this.emissiveMap, shininess: this.shininess, opacity: this.opacity, doubleSided: this.doubleSided });
  }
  destroy(): void { this.diffuseMap = null; this.normalMap = null; this.specularMap = null; this.emissiveMap = null; }
}

export function createBasicMaterial(color: Color = { r: 1, g: 1, b: 1, a: 1 }): Material { return new Material({ type: 'basic', diffuseColor: color }); }
export function createUnlitMaterial(color: Color = { r: 1, g: 1, b: 1, a: 1 }): Material { return new Material({ type: 'unlit', diffuseColor: color }); }