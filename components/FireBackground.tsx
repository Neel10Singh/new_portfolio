"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uResolution;
uniform float uTime;

// simplex 3D noise — Ashima Arts / Stefan Gustavson (MIT)
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x  = x_ * ns.x + ns.yyyy;
  vec4 y  = y_ * ns.x + ns.yyyy;
  vec4 h  = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p){
  float sum = 0.0, amp = 0.5;
  for (int i = 0; i < 3; i++) { sum += amp * snoise(p); p *= 2.03; amp *= 0.4; }
  return sum;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv.y = 1.0 - uv.y;                        // 0 = top, like CSS

  vec2 p = uv;
  p.x *= uResolution.x / uResolution.y;     // keep blobs round, not stretched

  float t = uTime * 0.055;                  // master speed

  // domain warping: noise fed through noise -> big lazy lava shapes
  vec3  q  = vec3(p * 1.5, t);              // was 1.5 — bigger, softer shapes
  float w1 = fbm(q);
  float n  = fbm(q + w1 * 0.45) * 0.5 + 0.5; // one warp pass, was two

  // let the noise disturb the middle/top, leave the hot bottom clean
  float mask = 1.0 - smoothstep(0.45, 0.95, uv.y);
  float heat = clamp(uv.y * 1.05 - 0.02 + (n - 0.5) * 0.65 * mask, 0.0, 1.0);

  vec3 c0 = vec3(0.008, 0.004, 0.004);      // near black
  vec3 c1 = vec3(0.330, 0.045, 0.008);      // deep ember
  vec3 c2 = vec3(0.860, 0.220, 0.030);      // orange-red
  vec3 c3 = vec3(0.970, 0.600, 0.280);      // warm light orange

  vec3 col = mix(c0, c1, smoothstep(0.10, 0.42, heat));
  col = mix(col, c2, smoothstep(0.38, 0.68, heat));
  col = mix(col, c3, smoothstep(0.66, 1.00, heat));

  // 1-bit dither: without this, huge smooth gradients band badly on 8-bit displays
  float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (d - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

type Props = {
  /** Render resolution multiplier. The effect is blurry, so 0.5 costs you nothing visually and ~4x less GPU. */
  scale?: number;
  speed?: number;
  className?: string;
};

export default function FireBackground({ scale = 0.5, speed = 1, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return; // CSS gradient underneath stays visible

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uResolution");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      gl.uniform1f(uTime, reduced ? 0 : ((now - start) / 1000) * speed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
      draw(performance.now());
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (!reduced) {
      const loop = (now: number) => {
        draw(now);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [scale, speed]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        width: "100%",
        height: "80%",
        bottom: 0,
        display: "block",
        zIndex: 0,
        // the browser bilinearly upscales the half-res buffer — free extra softness
        background: "linear-gradient(#000, #f2954a)",
      }}
    />
  );
}