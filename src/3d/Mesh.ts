// Mesh Component
import type { Vector3, Vector2, Vector4 } from '../core/types';

export interface MeshVertex { position: Vector3; normal: Vector3; texCoord: Vector2; tangent?: Vector4; }
export interface MeshOptions { vertices: Float32Array; normals?: Float32Array; texCoords?: Float32Array; indices?: Uint16Array; vertexCount: number; indexCount?: number; }

export class Mesh implements IComponent {
  readonly type = 'Mesh';
  vertices: Float32Array; normals: Float32Array | null = null; texCoords: Float32Array | null = null; tangents: Float32Array | null = null; indices: Uint16Array | null = null;
  vertexBuffer: WebGLBuffer | null = null; normalBuffer: WebGLBuffer | null = null; texCoordBuffer: WebGLBuffer | null = null; indexBuffer: WebGLBuffer | null = null;
  vao: WebGLVertexArrayObject | null = null; vertexCount: number = 0; indexCount: number = 0;
  boundingBox: { min: Vector3; max: Vector3 } = { min: { x: Infinity, y: Infinity, z: Infinity }, max: { x: -Infinity, y: -Infinity, z: -Infinity } };

  constructor(options: MeshOptions) {
    this.vertices = options.vertices; this.normals = options.normals || null; this.texCoords = options.texCoords || null;
    this.indices = options.indices || null; this.vertexCount = options.vertexCount; this.indexCount = options.indexCount || 0;
    this.calculateBoundingBox();
  }

  private calculateBoundingBox(): void {
    this.boundingBox = { min: { x: Infinity, y: Infinity, z: Infinity }, max: { x: -Infinity, y: -Infinity, z: -Infinity } };
    for (let i = 0; i < this.vertexCount; i++) {
      const x = this.vertices[i * 3]; const y = this.vertices[i * 3 + 1]; const z = this.vertices[i * 3 + 2];
      this.boundingBox.min.x = Math.min(this.boundingBox.min.x, x); this.boundingBox.min.y = Math.min(this.boundingBox.min.y, y); this.boundingBox.min.z = Math.min(this.boundingBox.min.z, z);
      this.boundingBox.max.x = Math.max(this.boundingBox.max.x, x); this.boundingBox.max.y = Math.max(this.boundingBox.max.y, y); this.boundingBox.max.z = Math.max(this.boundingBox.max.z, z);
    }
  }

  createBuffers(gl: WebGL2RenderingContext | WebGLRenderingContext): void {
    this.vertexBuffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    if (this.normals) { this.normalBuffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer); gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW); }
    if (this.texCoords) { this.texCoordBuffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer); gl.bufferData(gl.ARRAY_BUFFER, this.texCoords, gl.STATIC_DRAW); }
    if (this.indices) { this.indexBuffer = gl.createBuffer()!; gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW); }
    if (gl instanceof WebGL2RenderingContext) this.createVAO(gl); gl.bindBuffer(gl.ARRAY_BUFFER, null); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  private createVAO(gl: WebGL2RenderingContext): void {
    this.vao = gl.createVertexArray()!; gl.bindVertexArray(this.vao);
    if (this.vertexBuffer) { gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); }
    if (this.normalBuffer) { gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); }
    if (this.texCoordBuffer) { gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0); }
    gl.bindVertexArray(null);
  }

  destroy(gl: WebGL2RenderingContext | WebGLRenderingContext): void {
    if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer); if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer);
    if (this.texCoordBuffer) gl.deleteBuffer(this.texCoordBuffer); if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
    if (this.vao && gl instanceof WebGL2RenderingContext) gl.deleteVertexArray(this.vao);
    this.vertexBuffer = null; this.normalBuffer = null; this.texCoordBuffer = null; this.indexBuffer = null; this.vao = null;
  }

  getBoundingBox(): { min: Vector3; max: Vector3 } { return this.boundingBox; }
  clone(): Mesh {
    return new Mesh({ vertices: new Float32Array(this.vertices), normals: this.normals ? new Float32Array(this.normals) : undefined, texCoords: this.texCoords ? new Float32Array(this.texCoords) : undefined, indices: this.indices ? new Uint16Array(this.indices) : undefined, vertexCount: this.vertexCount, indexCount: this.indexCount });
  }
}

export function createCubeMesh(size: number = 1): Mesh {
  const halfSize = size / 2;
  const vertices = new Float32Array([-halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize, halfSize, -halfSize, -halfSize, halfSize, -halfSize, -halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, -halfSize, -halfSize, -halfSize, -halfSize, halfSize, halfSize, halfSize, -halfSize, -halfSize, -halfSize, -halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, -halfSize, -halfSize, -halfSize, halfSize]);
  const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, -1, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, -1, 0, 0, -1]);
  const texCoords = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 8, 9, 10, 8, 10, 11, 12, 14, 13, 12, 15, 14, 16, 17, 18, 16, 18, 19, 20, 22, 21, 20, 23, 22]);
  return new Mesh({ vertices, normals, texCoords, indices, vertexCount: 24, indexCount: 36 });
}

export function createPlaneMesh(width: number = 1, height: number = 1): Mesh {
  const halfWidth = width / 2; const halfHeight = height / 2;
  const vertices = new Float32Array([-halfWidth, -halfHeight, 0, halfWidth, -halfHeight, 0, halfWidth, halfHeight, 0, -halfWidth, halfHeight, 0]);
  const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
  const texCoords = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  return new Mesh({ vertices, normals, texCoords, indices, vertexCount: 4, indexCount: 6 });
}