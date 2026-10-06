import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { MotionService } from '../core/motion.service';

let uid = 0;

/** Trait de pinceau qui se dessine quand il entre à l'écran (après le préchargeur). */
@Component({
  selector: 'app-brush',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.drawn]': 'drawn()', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 600 28" preserveAspectRatio="none">
      <filter [id]="fid" x="-5%" y="-50%" width="110%" height="200%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
      <g [attr.filter]="'url(#' + fid + ')'">
        <path pathLength="1" d="M6 17C90 11 170 15 260 12S430 9 520 12 590 13 594 11" />
        <path class="thin" pathLength="1" d="M30 21C140 17 250 20 360 17S520 16 570 18" />
      </g>
    </svg>
  `,
  styles: `
    :host {
      display: block;
      height: 0.16em;
      min-height: 10px;
      color: var(--fg);
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    path {
      fill: none;
      stroke: currentColor;
      stroke-width: 7;
      stroke-linecap: round;
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      transition: stroke-dashoffset 1.1s cubic-bezier(0.65, 0, 0.35, 1);
    }
    .thin {
      stroke-width: 2.5;
      opacity: 0.55;
      transition-delay: 0.25s;
    }
    :host(.drawn) path {
      stroke-dashoffset: 0;
    }
  `,
})
export class Brush {
  protected readonly fid = `brush-${uid++}`;
  private readonly seen = signal(false);
  private readonly motion = inject(MotionService);
  protected readonly drawn = computed(() => this.seen() && this.motion.ready());

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const io = new IntersectionObserver(([e]) => e.isIntersecting && (this.seen.set(true), io.disconnect()), {
        threshold: 0.6,
      });
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
