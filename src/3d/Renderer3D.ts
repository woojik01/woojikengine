// 3D Renderer
import type { Transform3D, Vector3, Color } from '../core/types';

export interface Renderer3DOptions { canvas: HTMLCanvasElement; width: number; height: number; clearColor?: Color; maxLights?: number; }

export type LightType = 'directional' | 'point' | 'spot';
export interface Light { type: LightType; position: Vector3; direction: Vector3; color: Color; intensity: number; range: number; innerAngle: number; outerAngle: number; enabled: boolean; }
export interface Camera3D { position: Vector3; target: Vector3; up: Vector3; fov: number; near: number; far: number; projectionMatrix: Float32Array; viewMatrix: Float32Array; }

export class Renderer3D {
  private canvas: HTMLCanvasElement; private gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  private width: number; private height: number; private clearColor: Color = { r: 0, g: 0, b: 0, a: 1 };
  private camera: Camera3D; private lights: Light[] = []; private maxLights: number = 4;
  private basicShader: WebGLProgram | null = null; private unlitShader: WebGLProgram | null = null;
  private debug: boolean = false; private drawCallCount: number = 0; private triangleCount: number = 0;

  constructor(canvas: HTMLCanvasElement, width: number, height: number, options: Partial<Renderer3DOptions> = {}) {
    this.canvas = canvas; this.width = width; this.height = height;
    if (options.clearColor) this.clearColor = options.clearColor; if (options.maxLights) this.maxLights = options.maxLights;
    this.camera = { position: { x: 0, y: 0, z: 5 }, target: { x: 0, y: 0, z: 0 }, up: { x: 0, y: 1, z: 0 }, fov: 45, near: 0.1, far: 1000, projectionMatrix: new Float32Array(16), viewMatrix: new Float32Array(16) };
    this.initWebGL();
  }

  private initWebGL(): void {
    try {
      this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('experimental-webgl2') || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      if (!this.gl) { console.error('WebGL not supported'); return; }
      this.gl.viewport(0, 0, this.width, this.height);
      this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
      this.gl.clearDepth(1.0); this.gl.enable(this.gl.DEPTH_TEST); this.gl.depthFunc(this.gl.LEQUAL);
      this.compileShaders(); this.addDirectionalLight({ r: 1, g: 1, b: 1, a: 1 }, 1.0);
    } catch (e) { console.error('Failed to initialize WebGL:', e); }
  }

  private compileShaders(): void {
    if (!this.gl) return;
    const basicVertexShader = '#version 300 es
      precision highp float; in vec3 aPosition; in vec3 aNormal; in vec2 aTexCoord;
      uniform mat4 uModel; uniform mat4 uView; uniform mat4 uProjection;
      out vec3 vNormal; out vec2 vTexCoord; out vec3 vPosition;
      void main() { vNormal = mat3(uModel) * aNormal; vTexCoord = aTexCoord; vPosition = vec3(uModel * vec4(aPosition, 1.0)); gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0); }';
    const basicFragmentShader = '#version 300 es
      precision highp float; in vec3 vNormal; in vec2 vTexCoord; in vec3 vPosition;
      uniform vec3 uCameraPosition; uniform vec3 uLightDirection; uniform vec3 uLightColor; uniform float uLightIntensity;
      uniform sampler2D uDiffuseMap; uniform vec4 uDiffuseColor; out vec4 fragColor;
      void main() {
        vec3 normal = normalize(vNormal); vec3 lightDir = normalize(uLightDirection);
        float diff = max(dot(normal, lightDir), 0.0); vec3 diffuse = uLightColor * uLightIntensity * diff;
        vec4 texColor = texture(uDiffuseMap, vTexCoord);
        fragColor = vec4(texColor.rgb * diffuse * uDiffuseColor.rgb, texColor.a * uDiffuseColor.a);
      }';
    const unlitVertexShader = '#version 300 es
      precision highp float; in vec3 aPosition; in vec2 aTexCoord;
      uniform mat4 uModel; uniform mat4 uView; uniform mat4 uProjection;
      out vec2 vTexCoord; void main() { vTexCoord = aTexCoord; gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0); }';
    const unlitFragmentShader = '#version 300 es
      precision highp float; in vec2 vTexCoord; uniform sampler2D uDiffuseMap; uniform vec4 uDiffuseColor; out vec4 fragColor;
      void main() { vec4 texColor = texture(uDiffuseMap, vTexCoord); fragColor = texColor * uDiffuseColor; }';
    try {
      this.basicShader = this.compileShaderProgram(basicVertexShader, basicFragmentShader);
      this.unlitShader = this.compileShaderProgram(unlitVertexShader, unlitFragmentShader);
    } catch (e) { console.error('Failed to compile shaders:', e); }
  }

  private compileShaderProgram(vs: string, fs: string): WebGLProgram {
    if (!this.gl) throw new Error('WebGL not initialized');
    const vertexShader = this.compileShader(vs, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fs, this.gl.FRAGMENT_SHADER);
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader); this.gl.attachShader(program, fragmentShader); this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program); this.gl.deleteShader(vertexShader); this.gl.deleteShader(fragmentShader); this.gl.deleteProgram(program);
      throw new Error('Program linking failed: ' + error);
    }
    this.gl.deleteShader(vertexShader); this.gl.deleteShader(fragmentShader); return program;
  }

  private compileShader(source: string, type: number): WebGLShader {
    if (!this.gl) throw new Error('WebGL not initialized');
    const shader = this.gl.createShader(type)!; this.gl.shaderSource(shader, source); this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader); this.gl.deleteShader(shader); throw new Error('Shader compilation failed: ' + error);
    }
    return shader;
  }

  setContext(context: WebGL2RenderingContext | WebGLRenderingContext | null): void { this.gl = context; if (this.gl) this.initWebGL(); }
  setCamera(camera: Partial<Camera3D>): void { this.camera = { ...this.camera, ...camera }; this.updateCameraMatrices(); }
  setCameraPosition(x: number, y: number, z: number): void { this.camera.position = { x, y, z }; this.updateCameraMatrices(); }
  setCameraTarget(x: number, y: number, z: number): void { this.camera.target = { x, y, z }; this.updateCameraMatrices(); }
  setCameraFOV(fov: number): void { this.camera.fov = fov; this.updateCameraMatrices(); }
  setCameraClipping(near: number, far: number): void { this.camera.near = near; this.camera.far = far; this.updateCameraMatrices(); }

  private updateCameraMatrices(): void {
    if (!this.gl) return;
    const aspect = this.width / this.height; const fovRad = (this.camera.fov * Math.PI) / 180; const f = 1.0 / Math.tan(fovRad / 2);
    this.camera.projectionMatrix = new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (this.camera.far + this.camera.near) / (this.camera.near - this.camera.far), -1, 0, 0, (2 * this.camera.far * this.camera.near) / (this.camera.near - this.camera.far), 0]);
    const forward = { x: this.camera.target.x - this.camera.position.x, y: this.camera.target.y - this.camera.position.y, z: this.camera.target.z - this.camera.position.z };
    const length = Math.sqrt(forward.x * forward.x + forward.y * forward.y + forward.z * forward.z);
    if (length > 0) { forward.x /= length; forward.y /= length; forward.z /= length; }
    const right = { x: forward.y * this.camera.up.z - forward.z * this.camera.up.y, y: forward.z * this.camera.up.x - forward.x * this.camera.up.z, z: forward.x * this.camera.up.y - forward.y * this.camera.up.x };
    const up = { x: right.y * forward.z - right.z * forward.y, y: right.z * forward.x - right.x * forward.z, z: right.x * forward.y - right.y * forward.x };
    this.camera.viewMatrix = new Float32Array([right.x, up.x, -forward.x, 0, right.y, up.y, -forward.y, 0, right.z, up.z, -forward.z, 0, -(right.x * this.camera.position.x + right.y * this.camera.position.y + right.z * this.camera.position.z), -(up.x * this.camera.position.x + up.y * this.camera.position.y + up.z * this.camera.position.z), forward.x * this.camera.position.x + forward.y * this.camera.position.y + forward.z * this.camera.position.z, 1]);
  }

  addDirectionalLight(color: Color, intensity: number = 1.0): void {
    this.lights.push({ type: 'directional', position: { x: 0, y: 0, z: 0 }, direction: { x: 0.5, y: -1, z: -0.5 }, color, intensity, range: 0, innerAngle: 0, outerAngle: 0, enabled: true });
  }
  removeLight(index: number): void { this.lights.splice(index, 1); }
  getLights(): Light[] { return this.lights; }
  setDebug(debug: boolean): void { this.debug = debug; }

  render(world: any): void {
    if (!this.gl) return; this.drawCallCount = 0; this.triangleCount = 0;
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    const entities = world.getAllEntities();
    for (const entity of entities.values()) {
      if (!entity.isActive()) continue;
      const transform = entity.getComponent('Transform3D'); const mesh = entity.getComponent('Mesh'); const material = entity.getComponent('Material');
      if (!transform || !mesh || !material) continue;
      this.renderMesh(mesh, transform, material);
    }
    if (this.debug) console.log('3D Draw Calls: ' + this.drawCallCount + ', Triangles: ' + this.triangleCount);
  }

  private renderMesh(mesh: any, transform: any, material: any): void {
    if (!this.gl || !this.basicShader) return; const gl = this.gl;
    const modelMatrix = this.createModelMatrix(transform.position, transform.rotation, transform.scale);
    gl.useProgram(this.basicShader);
    const uModel = gl.getUniformLocation(this.basicShader, 'uModel'); const uView = gl.getUniformLocation(this.basicShader, 'uView');
    const uProjection = gl.getUniformLocation(this.basicShader, 'uProjection');
    const uCameraPosition = gl.getUniformLocation(this.basicShader, 'uCameraPosition');
    const uLightDirection = gl.getUniformLocation(this.basicShader, 'uLightDirection');
    const uLightColor = gl.getUniformLocation(this.basicShader, 'uLightColor');
    const uLightIntensity = gl.getUniformLocation(this.basicShader, 'uLightIntensity');
    const uDiffuseMap = gl.getUniformLocation(this.basicShader, 'uDiffuseMap');
    const uDiffuseColor = gl.getUniformLocation(this.basicShader, 'uDiffuseColor');
    if (uModel) gl.uniformMatrix4fv(uModel, false, modelMatrix); if (uView) gl.uniformMatrix4fv(uView, false, this.camera.viewMatrix);
    if (uProjection) gl.uniformMatrix4fv(uProjection, false, this.camera.projectionMatrix);
    if (uCameraPosition) gl.uniform3f(uCameraPosition, this.camera.position.x, this.camera.position.y, this.camera.position.z);
    if (this.lights.length > 0) { const light = this.lights[0]; if (uLightDirection) gl.uniform3f(uLightDirection, light.direction.x, light.direction.y, light.direction.z); if (uLightColor) gl.uniform3f(uLightColor, light.color.r, light.color.g, light.color.b); if (uLightIntensity) gl.uniform1f(uLightIntensity, light.intensity); }
    if (uDiffuseColor) gl.uniform4f(uDiffuseColor, material.diffuseColor.r, material.diffuseColor.g, material.diffuseColor.b, material.diffuseColor.a);
    if (material.diffuseMap && uDiffuseMap) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, material.diffuseMap.texture); gl.uniform1i(uDiffuseMap, 0); }
    gl.bindVertexArray(mesh.vao);
    if (mesh.indexCount > 0) { gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0); this.triangleCount += mesh.indexCount / 3; } else { gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount); this.triangleCount += mesh.vertexCount / 3; }
    this.drawCallCount++; gl.bindVertexArray(null); gl.bindTexture(gl.TEXTURE_2D, null);
  }

  private createModelMatrix(position: Vector3, rotation: any, scale: Vector3): Float32Array {
    const matrix = new Float32Array(16);
    const sx = scale.x, sy = scale.y, sz = scale.z;
    const qx = rotation.x, qy = rotation.y, qz = rotation.z, qw = rotation.w;
    const xx = qx * qx, yy = qy * qy, zz = qz * qz; const xy = qx * qy, xz = qx * qz, yz = qy * qz; const wx = qw * qx, wy = qw * qy, wz = qw * qz;
    matrix[0] = (1 - 2 * (yy + zz)) * sx; matrix[1] = 2 * (xy - wz) * sx; matrix[2] = 2 * (xz + wy) * sx; matrix[3] = 0;
    matrix[4] = 2 * (xy + wz) * sy; matrix[5] = (1 - 2 * (xx + zz)) * sy; matrix[6] = 2 * (yz - wx) * sy; matrix[7] = 0;
    matrix[8] = 2 * (xz - wy) * sz; matrix[9] = 2 * (yz + wx) * sz; matrix[10] = (1 - 2 * (xx + yy)) * sz; matrix[11] = 0;
    matrix[12] = position.x; matrix[13] = position.y; matrix[14] = position.z; matrix[15] = 1;
    return matrix;
  }

  getDrawCallCount(): number { return this.drawCallCount; }
  getTriangleCount(): number { return this.triangleCount; }
  destroy(): void { if (!this.gl) return; if (this.basicShader) this.gl.deleteProgram(this.basicShader); if (this.unlitShader) this.gl.deleteProgram(this.unlitShader); this.gl = null; }
}