// WebGL Utility Functions
import type { Vector3 } from '../core/types';

export class WebGLUtils {
  compileShader(gl: WebGL2RenderingContext | WebGLRenderingContext, source: string, type: number): WebGLShader | null {
    const shader = gl.createShader(type); if (!shader) return null;
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { const error = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error('Shader compilation failed: ' + error); }
    return shader;
  }

  compileShaderProgram(gl: WebGL2RenderingContext | WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram {
    const vertexShader = this.compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) throw new Error('Failed to compile shaders');
    const program = gl.createProgram()!; gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { const error = gl.getProgramInfoLog(program); gl.deleteShader(vertexShader); gl.deleteShader(fragmentShader); gl.deleteProgram(program); throw new Error('Program linking failed: ' + error); }
    gl.deleteShader(vertexShader); gl.deleteShader(fragmentShader); return program;
  }

  createBuffer(gl: WebGL2RenderingContext | WebGLRenderingContext, data: ArrayBuffer, usage: number = gl.STATIC_DRAW): WebGLBuffer {
    const buffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, usage); gl.bindBuffer(gl.ARRAY_BUFFER, null); return buffer;
  }

  createIndexBuffer(gl: WebGL2RenderingContext | WebGLRenderingContext, data: ArrayBuffer, usage: number = gl.STATIC_DRAW): WebGLBuffer {
    const buffer = gl.createBuffer()!; gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, usage); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); return buffer;
  }

  createVAO(gl: WebGL2RenderingContext | WebGLRenderingContext, program: WebGLProgram, attributes: any[]): WebGLVertexArrayObject | null {
    if (!(gl instanceof WebGL2RenderingContext)) { console.warn('VAO not supported in WebGL 1.0'); return null; }
    const vao = gl.createVertexArray(); if (!vao) return null; gl.bindVertexArray(vao);
    for (const attr of attributes) {
      const location = gl.getAttribLocation(program, attr.name); if (location === -1) continue;
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer); gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, attr.size, attr.type, attr.normalized, attr.stride, attr.offset);
    }
    gl.bindVertexArray(null); return vao;
  }

  createTexture(gl: WebGL2RenderingContext | WebGLRenderingContext, image: HTMLImageElement | ImageBitmap): WebGLTexture {
    const texture = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null); return texture;
  }

  createModelMatrix(position: Vector3, rotation: any, scale: Vector3): Float32Array {
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

  normalizeVector(v: Vector3): Vector3 { const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); if (length === 0) return { x: 0, y: 0, z: 0 }; return { x: v.x / length, y: v.y / length, z: v.z / length }; }
  crossProduct(a: Vector3, b: Vector3): Vector3 { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
  dotProduct(a: Vector3, b: Vector3): number { return a.x * b.x + a.y * b.y + a.z * b.z; }
  addVector(a: Vector3, b: Vector3): Vector3 { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
  subtractVector(a: Vector3, b: Vector3): Vector3 { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
  multiplyVector(v: Vector3, scalar: number): Vector3 { return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar }; }
  identityMatrix(): Float32Array { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  translationMatrix(x: number, y: number, z: number): Float32Array { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
  scaleMatrix(x: number, y: number, z: number): Float32Array { return new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]); }
  rotationXMatrix(angle: number): Float32Array { const c = Math.cos(angle); const s = Math.sin(angle); return new Float32Array([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]); }
  rotationYMatrix(angle: number): Float32Array { const c = Math.cos(angle); const s = Math.sin(angle); return new Float32Array([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]); }
  rotationZMatrix(angle: number): Float32Array { const c = Math.cos(angle); const s = Math.sin(angle); return new Float32Array([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  perspectiveMatrix(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fov * Math.PI / 360); return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0]);
  }
  orthographicMatrix(left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array {
    return new Float32Array([2 / (right - left), 0, 0, 0, 0, 2 / (top - bottom), 0, 0, 0, 0, -2 / (far - near), 0, -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1]);
  }
}