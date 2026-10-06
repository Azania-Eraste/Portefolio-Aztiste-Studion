import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

import { fragmentShader, vertexShader } from './shaders';

export interface SceneOptions {
  count: number;
  reduced: boolean;
}

/**
 * Nuage de particules : sphère → terrain selon `setMorph`.
 * Un seul renderer pour toute la vie de la page.
 */
export class ParticleScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(45, 1, 0.1, 100);
  private readonly material: ShaderMaterial;
  private readonly points: Points;

  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private morph = { value: 0, target: 0 };
  private raf = 0;
  private running = false;
  private start = performance.now();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly opts: SceneOptions,
  ) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.camera.position.set(0, 0, 6);

    const geometry = this.buildGeometry(opts.count);
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uMouse: { value: [0, 0] },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uSize: { value: 22 },
        uColor: { value: new Color('#f2f2ec') },
        uAccent: { value: new Color('#ff6e10') },
      },
    });
    this.points = new Points(geometry, this.material);
    this.scene.add(this.points);

    this.resize();
  }

  private buildGeometry(count: number) {
    const sphere = new Float32Array(count * 3);
    const terrain = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const side = Math.ceil(Math.sqrt(count));

    for (let i = 0; i < count; i++) {
      // Répartition uniforme sur la sphère (spirale de Fibonacci)
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * Math.PI * (3 - Math.sqrt(5));
      const R = 1.55;
      sphere.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);

      // Grille pour le terrain, inclinée vers la caméra
      const gx = (i % side) / side - 0.5;
      const gz = Math.floor(i / side) / side - 0.5;
      terrain.set([gx * 16, -1.6, gz * 12 - 2], i * 3);

      seed[i] = Math.random();
    }

    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(sphere, 3));
    g.setAttribute('aTerrain', new BufferAttribute(terrain, 3));
    g.setAttribute('aSeed', new BufferAttribute(seed, 1));
    return g;
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Sur écran étroit, on recule pour garder la sphère entière
    this.camera.position.z = w < h ? 8.5 : 6;
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render();
  }

  setPointer(x: number, y: number) {
    this.mouse.tx = x;
    this.mouse.ty = y;
  }

  setMorph(v: number) {
    this.morph.target = v;
    if (this.opts.reduced) {
      this.morph.value = v;
      this.render();
    }
  }

  play() {
    if (this.opts.reduced || this.running) {
      this.render();
      return;
    }
    this.running = true;
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.render();
    };
    loop();
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private render() {
    const t = (performance.now() - this.start) / 1000;
    const u = this.material.uniforms;
    const k = this.opts.reduced ? 1 : 0.06;

    this.mouse.x += (this.mouse.tx - this.mouse.x) * k;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * k;
    this.morph.value += (this.morph.target - this.morph.value) * (this.opts.reduced ? 1 : 0.08);

    u['uTime'].value = this.opts.reduced ? 2 : t;
    u['uMorph'].value = this.morph.value;
    u['uMouse'].value = [this.mouse.x, this.mouse.y];

    // Rotation lente + parallaxe souris, qui s'éteint en mode terrain
    const spin = 1 - this.morph.value;
    this.points.rotation.y = (this.opts.reduced ? 0.6 : t * 0.08) * spin + this.mouse.x * 0.25 * spin;
    this.points.rotation.x = this.mouse.y * 0.15 * spin;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.pause();
    this.points.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
