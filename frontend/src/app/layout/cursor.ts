import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';

import { MotionService } from '../core/motion.service';

/**
 * Curseur custom (desktop uniquement). Un élément avec `data-cursor="Voir"`
 * affiche une petite étiquette inclinée à côté du pointeur, qui ne masque jamais le contenu.
 */
@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (enabled) {
      <div class="ring" #ring [class.active]="label() !== null" [class.live]="live()" aria-hidden="true">
        <span class="mono">{{ label() }}</span>
      </div>
      <div class="dot" #dot [class.live]="live()" aria-hidden="true"></div>
    }
  `,
  styles: `
    .ring,
    .dot {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 300;
      pointer-events: none;
      border-radius: 50%;
      opacity: 0;
    }
    .live {
      opacity: 1;
    }
    .dot {
      width: 6px;
      height: 6px;
      margin: -3px 0 0 -3px;
      background: var(--accent);
    }
    .ring {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      margin: -18px 0 0 -18px;
      border: 1px solid var(--line-strong);
      transition:
        width 0.4s var(--ease-out),
        height 0.4s var(--ease-out),
        margin 0.4s var(--ease-out),
        background 0.3s;
      span {
        opacity: 0;
        color: var(--accent-ink);
        font-size: 11px;
        transition: opacity 0.2s;
      }
      &.active {
        width: 12px;
        height: 12px;
        margin: -6px 0 0 -6px;
        background: transparent;
        border-color: var(--accent);
        span {
          position: absolute;
          top: 18px;
          left: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 8px 24px -6px rgba(255, 110, 16, 0.8);
          white-space: nowrap;
          transform: rotate(-12deg);
          opacity: 1;
        }
      }
    }
  `,
})
export class Cursor {
  private readonly motion = inject(MotionService);
  protected readonly enabled = !this.motion.coarse && matchMedia('(hover: hover)').matches;
  protected readonly label = signal<string | null>(null);
  protected readonly live = signal(false);

  private readonly ring = viewChild<ElementRef<HTMLElement>>('ring');
  private readonly dot = viewChild<ElementRef<HTMLElement>>('dot');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!this.enabled) return;
      document.documentElement.classList.add('has-cursor');
      const ring = this.ring()!.nativeElement;
      const dot = this.dot()!.nativeElement;
      const lag = this.motion.reduced ? 0 : 0.5;
      const rx = gsap.quickTo(ring, 'x', { duration: lag, ease: 'power3' });
      const ry = gsap.quickTo(ring, 'y', { duration: lag, ease: 'power3' });

      const onMove = (e: PointerEvent) => {
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        this.live.set(true);
        rx(e.clientX);
        ry(e.clientY);
        const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
        this.label.set(target ? target.dataset['cursor'] ?? '' : null);
      };
      addEventListener('pointermove', onMove, { passive: true });
      destroyRef.onDestroy(() => removeEventListener('pointermove', onMove));
    });
  }
}
