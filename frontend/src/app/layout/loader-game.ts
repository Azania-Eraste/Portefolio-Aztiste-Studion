/**
 * Mini-jeu du préchargeur : le monogramme « az » saute par-dessus du code.
 * Un seul bouton (Espace / ↑ / tap). Canvas 2D, aucune dépendance.
 */

import { t } from '../core/i18n';

const C = {
  fg: '#f2f2ec',
  muted: '#8f8f88',
  line: 'rgba(242, 242, 236, 0.18)',
  accent: '#ff6e10',
  ink: '#050505',
};
const GLYPHS = ['{ }', '</>', ';', '#', '[ ]', '=>', '//', '&&'];
const GRAVITY = 2400; // px/s²
const JUMP = -760; // px/s
const PLAYER = 30; // côté du carré « az »
const BEST_KEY = 'aztiste-runner-best';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Collision rectangle/rectangle, avec une marge pour pardonner les frôlements. */
export function hits(a: Box, b: Box, slack = 4): boolean {
  return (
    a.x + slack < b.x + b.w - slack &&
    a.x + a.w - slack > b.x + slack &&
    a.y + slack < b.y + b.h - slack &&
    a.y + a.h - slack > b.y + slack
  );
}

interface Obstacle extends Box {
  glyph: string;
}

export class RunnerGame {
  state: 'idle' | 'run' | 'over' = 'idle';
  score = 0;
  best = readBest();

  private readonly ctx: CanvasRenderingContext2D;
  private readonly ro: ResizeObserver;
  private w = 0;
  private h = 0;
  private ground = 0;
  private y = 0;
  private vy = 0;
  private speed = 0;
  private dist = 0;
  private obstacles: Obstacle[] = [];
  private raf = 0;
  private last = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onFirstPlay: () => void,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Espace, flèche haut ou tap. */
  jump() {
    if (this.state === 'idle' || this.state === 'over') {
      if (this.state === 'idle') this.onFirstPlay();
      this.reset();
      this.state = 'run';
    }
    if (this.y >= this.ground - PLAYER) this.vy = JUMP;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
  }

  private reset() {
    this.y = this.ground - PLAYER;
    this.vy = 0;
    this.speed = 380;
    this.dist = 0;
    this.score = 0;
    this.obstacles = [];
  }

  private resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ground = this.h - 28;
    if (this.state !== 'run') this.y = this.ground - PLAYER;
  }

  private readonly tick = (now: number) => {
    const dt = Math.min((now - (this.last || now)) / 1000, 0.05);
    this.last = now;
    if (this.state === 'run') this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  private update(dt: number) {
    this.speed = Math.min(this.speed + 14 * dt, 900);
    this.dist += this.speed * dt;
    this.score = Math.floor(this.dist / 40);

    this.vy += GRAVITY * dt;
    this.y = Math.min(this.y + this.vy * dt, this.ground - PLAYER);

    for (const o of this.obstacles) o.x -= this.speed * dt;
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > 0);

    const lastX = this.obstacles.at(-1)?.x ?? 0;
    const gap = 240 + Math.random() * 320 + this.speed * 0.25;
    if (this.w - lastX > gap) this.spawn();

    const me = { x: 48, y: this.y, w: PLAYER, h: PLAYER };
    if (this.obstacles.some((o) => hits(me, o))) {
      this.state = 'over';
      if (this.score > this.best) {
        this.best = this.score;
        writeBest(this.best);
      }
    }
  }

  private spawn() {
    const glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];
    this.ctx.font = '700 26px "JetBrains Mono", monospace';
    const w = this.ctx.measureText(glyph).width;
    const h = 24;
    this.obstacles.push({ glyph, x: this.w + 10, y: this.ground - h, w, h });
  }

  private draw() {
    const { ctx, w, h, ground } = this;
    ctx.clearRect(0, 0, w, h);

    // Sol + graduations qui défilent
    ctx.fillStyle = C.line;
    ctx.fillRect(0, ground, w, 1);
    const off = this.dist % 40;
    for (let x = -off; x < w; x += 40) ctx.fillRect(x, ground + 6, 8, 1);

    // Obstacles : du code
    ctx.fillStyle = C.fg;
    ctx.font = '700 26px "JetBrains Mono", monospace';
    ctx.textBaseline = 'bottom';
    for (const o of this.obstacles) ctx.fillText(o.glyph, o.x, ground + 2);

    // Joueur : le carré orange « az »
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.roundRect(48, this.y, PLAYER, PLAYER, 6);
    ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = '700 15px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('az', 48 + PLAYER / 2, this.y + PLAYER / 2 + 1);
    ctx.textAlign = 'left';

    // Score
    ctx.fillStyle = C.muted;
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    const pad = (n: number) => String(n).padStart(5, '0');
    const label = `SCORE ${pad(this.score)}   RECORD ${pad(this.best)}`;
    ctx.fillText(label, w - ctx.measureText(label).width, 0);

    // Messages
    if (this.state !== 'run') {
      const msg = t(this.state === 'idle' ? 'game.idle' : 'game.over');
      ctx.fillStyle = this.state === 'over' ? C.accent : C.fg;
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText(msg, Math.max(0, (w - ctx.measureText(msg).width) / 2), h / 2 - 10);
    }
  }
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    // stockage indisponible (navigation privée) : le record reste en mémoire
  }
}
