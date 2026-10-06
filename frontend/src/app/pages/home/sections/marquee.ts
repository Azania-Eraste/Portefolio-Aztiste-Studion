import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TPipe, pick } from '../../../core/i18n';

const WORDS = pick({
  fr: ['Identité visuelle', 'Angular', 'Print', 'Django', 'Packaging', 'WebGL', 'UI design', 'API REST', 'Typographie', 'Motion'],
  en: ['Visual identity', 'Angular', 'Print', 'Django', 'Packaging', 'WebGL', 'UI design', 'REST APIs', 'Typography', 'Motion'],
});

@Component({
  selector: 'app-marquee',
  imports: [TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marquee" role="marquee" [attr.aria-label]="('marquee.label' | t) + ' : ' + words.join(', ')">
      @for (copy of [0, 1]; track copy) {
        <div class="track" aria-hidden="true">
          @for (w of words; track w) {
            <span class="display">{{ w }}</span><span class="star accent">/</span>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .marquee {
      position: relative;
      z-index: 2;
      display: flex;
      overflow: hidden;
      padding: 28px 0;
      border-block: 1px solid var(--line);
      background: var(--bg);
      transform: rotate(-2deg) scale(1.04);
    }
    .track {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      animation: slide 28s linear infinite;
    }
    .display {
      white-space: nowrap;
      font-size: clamp(40px, 7vw, 112px);
      padding: 0 0.3em;
    }
    .star {
      font-family: var(--font-mono);
      font-size: clamp(32px, 5vw, 80px);
    }
    .marquee:hover .track {
      animation-play-state: paused;
    }
    @keyframes slide {
      to {
        transform: translateX(-100%);
      }
    }
  `,
})
export class Marquee {
  protected readonly words = WORDS;
}
