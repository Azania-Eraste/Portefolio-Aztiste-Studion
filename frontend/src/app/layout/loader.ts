import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';

import { ApiService } from '../core/api.service';
import { MotionService } from '../core/motion.service';
import { RunnerGame } from './loader-game';
import { TPipe } from '../core/i18n';

const MIN_MS = 1400; // évite le flash sur une connexion rapide
const MAX_MS = 15000; // on n'enferme jamais le visiteur

@Component({
  selector: 'app-loader',
  imports: [TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:keydown)': 'onKey($event)' },
  template: `
    @if (visible()) {
      <div class="loader" #root>
        <p class="visually-hidden" role="status">
          {{ (ready() ? 'loader.ready' : 'loader.loading') | t }}
        </p>
        <div class="head">
          <span class="logo-mark accent" aria-hidden="true"></span>
          <span class="mono tag" aria-hidden="true">{{ 'pole.design' | t }}<br />{{ 'pole.dev' | t }}</span>
        </div>

        <div class="stage">
          <canvas
            #game
            class="game"
            role="img"
            [attr.aria-label]="'loader.game' | t"
            (pointerdown)="tap($event)"
          ></canvas>
        </div>

        <div class="foot">
          <ol class="log mono" aria-hidden="true">
            @for (s of steps(); track s.label) {
              <li [class.ok]="s.ok">
                <span class="accent">&gt;</span> {{ s.label }}
                <span class="st">{{ s.ok ? 'ok' : '…' }}</span>
              </li>
            }
          </ol>
          <div class="right">
            @if (ready() && played()) {
              <button type="button" class="enter mono" (click)="enter()">
                {{ 'loader.enter' | t }} <span aria-hidden="true">↵</span>
              </button>
            }
            <div class="count display" aria-hidden="true">{{ pad(count()) }}</div>
          </div>
        </div>
        <div class="bar" aria-hidden="true"><span [style.transform]="'scaleX(' + count() / 100 + ')'"></span></div>
      </div>
    }
  `,
  styles: `
    .loader {
      position: fixed;
      inset: 0;
      z-index: 200;
      display: grid;
      grid-template-rows: auto 1fr auto auto;
      padding: var(--gutter);
      background: var(--bg);
      color: var(--fg);
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      .logo-mark {
        height: clamp(28px, 4vw, 48px);
      }
      .tag {
        color: var(--muted);
        text-align: right;
      }
    }
    .stage {
      display: grid;
      align-items: center;
      min-height: 0;
    }
    .game {
      width: 100%;
      height: clamp(160px, 30vh, 260px);
      touch-action: manipulation;
      cursor: pointer;
    }
    .foot {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
    }
    .log {
      margin: 0;
      padding: 0;
      list-style: none;
      color: var(--muted);
      line-height: 2;
      .st {
        margin-left: 6px;
      }
      .ok .st {
        color: var(--fg);
      }
    }
    .right {
      margin-left: auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 16px;
    }
    .enter {
      min-height: 48px;
      padding: 0 22px;
      border-radius: 999px;
      background: var(--accent);
      color: var(--accent-ink);
      animation: pop 0.5s var(--ease-out);
    }
    .count {
      font-size: clamp(64px, 14vw, 220px);
      line-height: 0.8;
    }
    .bar {
      height: 2px;
      margin-top: 24px;
      background: var(--line);
      span {
        display: block;
        height: 100%;
        background: var(--accent);
        transform-origin: left;
      }
    }
    @keyframes pop {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
    @media (max-width: 600px) {
      .log {
        display: none;
      }
    }
  `,
})
export class Loader {
  private readonly motion = inject(MotionService);
  private readonly api = inject(ApiService);
  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('game');

  protected readonly visible = signal(true);
  protected readonly count = signal(0);
  protected readonly played = signal(false);
  private readonly tickChecks = signal(0); // incrémenté à chaque frame pour relire le DOM
  private readonly timedOut = signal(false);
  private game?: RunnerGame;
  private leaving = false;

  /** Étapes réelles du chargement, affichées dans le log. */
  protected readonly steps = computed(() => {
    this.tickChecks();
    const html = document.documentElement;
    return [
      { label: 'load  fonts ...............', ok: document.fonts.status === 'loaded' },
      { label: 'load  page & assets ........', ok: document.readyState === 'complete' },
      { label: 'mount angular · home .......', ok: !!document.querySelector('app-home') },
      { label: 'fetch /api/projects ........', ok: this.api.projects().status !== 'loading' },
      { label: 'boot  webgl · shaders ......', ok: html.dataset['webgl'] === 'ready' },
    ];
  });

  protected readonly ready = computed(() => this.timedOut() || this.steps().every((s) => s.ok));

  protected pad = (n: number) => String(n).padStart(3, '0');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const t0 = performance.now();
      this.game = new RunnerGame(this.canvas()!.nativeElement, () => this.played.set(true));

      let raf = 0;
      const loop = (now: number) => {
        this.tickChecks.update((n) => n + 1);
        if (now - t0 > MAX_MS) this.timedOut.set(true);

        // Progression = étapes réelles, freinée par la durée minimale
        const steps = this.steps();
        const real = (steps.filter((s) => s.ok).length / steps.length) * 100;
        const target = Math.min(this.ready() ? 100 : real, ((now - t0) / MIN_MS) * 100);
        this.count.update((c) => Math.min(100, Math.ceil(c + (target - c) * 0.12)));

        // Le visiteur qui ne joue pas entre automatiquement ; le joueur choisit son moment
        if (this.count() >= 100 && !this.played()) return void this.enter();
        if (!this.leaving) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        this.game?.destroy();
      });
    });
  }

  protected tap(e: PointerEvent) {
    e.preventDefault();
    this.game?.jump();
  }

  protected onKey(e: KeyboardEvent) {
    if (!this.visible() || this.leaving) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault(); // pas de défilement de la page derrière
      this.game?.jump();
    } else if (e.key === 'Enter' && this.ready()) {
      e.preventDefault();
      this.enter();
    }
  }

  enter() {
    if (this.leaving) return;
    this.leaving = true;
    this.game?.destroy();

    const done = () => {
      this.visible.set(false);
      this.motion.unlock();
      window.dispatchEvent(new Event('app:ready'));
    };
    if (this.motion.reduced) return done();
    gsap.to(this.root()!.nativeElement, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.1,
      ease: 'expo.inOut',
      onComplete: done,
    });
  }
}
