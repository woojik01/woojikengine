// Woojik Engine Core Types

export type ID = number;

export interface Vector2 { x: number; y: number; }
export interface Size2 { width: number; height: number; }
export interface Transform2D { x: number; y: number; rotation: number; scaleX: number; scaleY: number; pivotX?: number; pivotY?: number; }

export interface Vector3 { x: number; y: number; z: number; }
export interface Quaternion { x: number; y: number; z: number; w: number; }
export interface Transform3D { position: Vector3; rotation: Quaternion; scale: Vector3; }

export interface Color { r: number; g: number; b: number; a: number; }
export interface Texture { image: HTMLImageElement | ImageBitmap; width: number; height: number; loaded: boolean; }

export interface SpriteFrame { x: number; y: number; width: number; height: number; }
export interface AABB { minX: number; minY: number; maxX: number; maxY: number; }
export interface CircleCollider { x: number; y: number; radius: number; }

export type EntityID = number;
export type ComponentType = string;
export type SystemType = string;
export type RenderLayer = number;
export type BlendMode = 'normal' | 'additive' | 'multiply' | 'screen';
export type CameraType = 'static' | 'follow' | 'free';
export type InputAction = string;
export type AudioGroup = 'bgm' | 'sfx' | 'voice';
export type AssetType = 'image' | 'audio' | 'json' | 'gltf' | 'font' | 'shader';
export type LoadingState = 'idle' | 'loading' | 'complete' | 'error';
export type SceneState = 'loading' | 'ready' | 'active' | 'paused' | 'unloading';
export interface Rectangle { x: number; y: number; width: number; height: number; }