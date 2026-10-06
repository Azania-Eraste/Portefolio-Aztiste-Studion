import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { SITE } from '../core/site.config';

const STEP = 100; // une étiquette tous les 100 px

/**
 * Cadre « plan de travail » (desktop) : règles graduées, repères de coins,
 * lecture X / Y / progression / section courante.
 */
@Component({
  selector: 'app-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="ruler top">
      @for (x of xs(); track x) {
        <span class="n" [style.left.px]="x">{{ x }}</span>
      }
      <span class="mark" [style.left.px]="pos().x"></span>
    </div>
    <div class="ruler left" [style.background-position-y.px]="-scroll() % 10">
      @for (y of ys(); track y.v) {
        <span class="n" [style.top.px]="y.top">{{ y.v }}</span>
      }
      <span class="mark" [style.top.px]="pos().y"></span>
    </div>
    <span class="cross tl">+</span><span class="cross tr">+</span>
    <span class="cross bl">+</span><span class="cross br">+</span>
    <p class="readout mono">
      X:{{ pad(pos().x) }} Y:{{ pad(pos().y + scroll()) }} P:{{ pad(progress(), 3) }}% S:{{ section() }}
    </p>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 100;
      pointer-events: none;
      font-family: var(--font-mono);
      color: var(--muted);
    }
    .ruler {
      position: absolute;
      overflow: hidden;
      background-color: var(--bg);
    }
    .top {
      top: 0;
      left: 0;
      right: 0;
      height: 18px;
      border-bottom: 1px solid var(--line);
      background-image:
        linear-gradient(to right, var(--line-strong) 1px, transparent 1px),
        linear-gradient(to right, var(--line) 1px, transparent 1px);
      background-size:
        100px 8px,
        10px 4px;
      background-repeat: repeat-x;
      background-position: 0 100%;
    }
    .left {
      top: 18px;
      bottom: 0;
      left: 0;
      width: 18px;
      border-right: 1px solid var(--line);
      background-image: linear-gradient(to bottom, var(--line) 1px, transparent 1px);
      background-size: 4px 10px;
      background-repeat: repeat-y;
      background-position-x: 100%;
    }
    .n {
      position: absolute;
      font-size: 8px;
      line-height: 1;
    }
    .top .n {
      top: 2px;
      margin-left: 3px;
    }
    .left .n {
      left: 1px;
      margin-top: 2px;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
    .mark {
      position: absolute;
      border: 4px solid transparent;
    }
    .top .mark {
      bottom: 0;
      margin-left: -4px;
      border-bottom-color: var(--accent);
    }
    .left .mark {
      right: 0;
      margin-top: -4px;
      border-right-color: var(--accent);
    }
    .cross {
      position: absolute;
      font-size: 18px;
      font-weight: 300;
      line-height: 1;
      color: var(--line-strong);
    }
    .tl { top: 26px; left: 26px; }
    .tr { top: 26px; right: 12px; }
    .bl { bottom: 10px; left: 26px; }
    .br { bottom: 10px; right: 12px; }
    .readout {
      position: absolute;
      right: 14px;
      top: 50%;
      margin: 0;
      font-size: 10px;
      letter-spacing: 0.08em;
      writing-mode: vertical-rl;
      transform: translateY(-50%);
      white-space: nowrap;
    }
    @media (max-width: 900px), (hover: none) {
      :host {
        display: none;
      }
    }
  `,
})
export class Frame {
  protected readonly pos = signal({ x: 0, y: 0 });
  protected readonly scroll = signal(0);
  protected readonly progress = signal(0);
  protected readonly section = signal('INTRO');
  protected readonly xs = signal<number[]>([]);
  protected readonly ys = signal<{ v: number; top: number }[]>([]);

  protected pad = (n: number, len = 4) => String(Math.max(0, Math.round(n))).padStart(len, '0');

  constructor() {
    const ids: [string, string][] = [['top', 'INTRO'], ...SITE.nav.map((n) => [n.id, n.label.toUpperCase()] as [string, string])];

    const layout = () => {
      this.xs.set(Array.from({ length: Math.floor(innerWidth / STEP) }, (_, i) => (i + 1) * STEP));
    };
    const onScroll = () => {
      const y = scrollY;
      this.scroll.set(y);
      const max = document.documentElement.scrollHeight - innerHeight;
      this.progress.set(max > 0 ? (y / max) * 100 : 0);
      // Étiquettes de la règle verticale = coordonnées dans la page
      const first = Math.ceil(y / STEP) * STEP;
      this.ys.set(
        Array.from({ length: Math.ceil(innerHeight / STEP) }, (_, i) => ({ v: first + i * STEP, top: first + i * STEP - y - 18 })),
      );
      // Section courante : la dernière dont le haut a passé le milieu de l'écran
      let current = location.pathname.startsWith('/projets/') ? 'CASE' : ids[0][1];
      for (const [id, label] of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < innerHeight / 2) current = label;
      }
      this.section.set(current);
    };
    const onMove = (e: PointerEvent) => this.pos.set({ x: e.clientX, y: e.clientY });

    layout();
    onScroll();
    addEventListener('resize', layout);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('pointermove', onMove, { passive: true });
    inject(DestroyRef).onDestroy(() => {
      removeEventListener('resize', layout);
      removeEventListener('scroll', onScroll);
      removeEventListener('pointermove', onMove);
    });
  }
}
