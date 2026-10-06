import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ApiService } from '../../../core/api.service';
import { MotionService } from '../../../core/motion.service';
import { Brush } from '../../../shared/brush';
import { TPipe, t } from '../../../core/i18n';

const LINE_1 = t('intro.l1');
const LINE_2 = t('intro.l2');

/** Chapitre d'intro : slogan qui se recompose au scroll + chiffres clés. */
@Component({
  selector: 'app-intro',
  imports: [TPipe, Brush],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section intro" #root aria-labelledby="intro-title">
      <h2 id="intro-title" class="display slogan" [attr.aria-label]="line1 + ' ' + line2">
        <span class="l1" aria-hidden="true">
          @for (c of line1; track $index) {
            <span class="ch">{{ c }}</span>
          }
        </span>
        <span class="l2 accent" aria-hidden="true">
          @for (c of line2; track $index) {
            <span class="ch">{{ c }}</span>
          }
        </span>
      </h2>
      <app-brush class="stroke" />
      <p class="sub mono">{{ 'intro.sub' | t }}</p>

      <ul class="stats">
        <li class="arrow" aria-hidden="true">↗</li>
        @for (s of stats(); track s.label; let i = $index) {
          <li>
            <span class="num display" [attr.aria-label]="s.value + (s.plus ? '+' : '')">
              {{ shown()[i] }}<span class="plus">{{ s.plus ? '+' : '' }}</span>
            </span>
            <span class="what mono">{{ s.label }}</span>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .intro {
      min-height: 100svh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .slogan {
      margin: 0;
      font-size: clamp(44px, 8vw, 168px);
      text-shadow: 0 0 48px rgba(242, 242, 236, 0.12);
    }
    .l1,
    .l2 {
      display: block;
      white-space: nowrap;
    }
    .l2 {
      padding-left: 0.5em;
      text-shadow: 0 0 48px rgba(255, 110, 16, 0.35);
    }
    .ch {
      display: inline-block;
      white-space: pre;
      will-change: transform, filter, opacity;
    }
    .stroke {
      width: min(78%, 1100px);
      margin: 0.2em 0 0 0.4em;
      font-size: clamp(44px, 8vw, 168px);
    }
    .sub {
      margin: 40px 0 0;
      max-width: 52ch;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.7;
    }
    .stats {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: clamp(32px, 6vw, 96px);
      margin: clamp(48px, 10vh, 120px) 0 0;
      padding: 0 0 0 clamp(0px, 8vw, 140px);
      list-style: none;
      li {
        display: flex;
        align-items: flex-end;
        gap: 14px;
      }
    }
    .arrow {
      font-family: var(--font-hand);
      font-size: 56px;
      line-height: 1;
      transform: rotate(-8deg);
    }
    .num {
      font-size: clamp(56px, 7vw, 112px);
      line-height: 0.8;
      color: var(--accent);
      font-variant-numeric: tabular-nums;
    }
    .plus {
      font-size: 0.5em;
      vertical-align: top;
    }
    .what {
      max-width: 12ch;
      color: var(--muted);
      line-height: 1.5;
    }
    @media (max-width: 767px) {
      .l1,
      .l2 {
        white-space: normal;
      }
      .arrow {
        display: none;
      }
    }
  `,
})
export class Intro {
  private readonly api = inject(ApiService);
  private readonly motion = inject(MotionService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  protected readonly line1 = LINE_1;
  protected readonly line2 = LINE_2;

  protected readonly stats = computed(() => {
    const projects = this.api.projects().data.length;
    const starts = this.api.experiences().data.map((e) => new Date(e.start).getFullYear());
    const years = starts.length ? new Date().getFullYear() - Math.min(...starts) : 0;
    return [
      { value: projects, plus: true, label: t('intro.projects') },
      { value: years, plus: true, label: t('intro.years') },
      { value: 2, plus: false, label: t('intro.poles') },
    ];
  });

  private readonly inView = signal(false);
  protected readonly shown = signal(['00', '00', '00']);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const pad = (n: number) => String(Math.round(n)).padStart(2, '0');

    // Compteurs : animés une fois la section visible et les données arrivées
    effect(() => {
      const targets = this.stats().map((s) => s.value);
      if (!this.inView()) return;
      if (this.motion.reduced) return this.shown.set(targets.map(pad));
      const o = { t: 0 };
      gsap.to(o, {
        t: 1,
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => this.shown.set(targets.map((v) => pad(v * o.t))),
      });
    });

    afterNextRender(() => {
      const el = this.root().nativeElement;
      const ctx = gsap.context(() => {
        ScrollTrigger.create({ trigger: el.querySelector('.stats'), start: 'top 85%', once: true, onEnter: () => this.inView.set(true) });
        if (this.motion.reduced) return;
        // Lettres floues et dispersées qui se recomposent au rythme du scroll
        gsap.from(el.querySelectorAll('.ch'), {
          opacity: 0,
          filter: 'blur(14px)',
          yPercent: () => gsap.utils.random(-60, 60),
          scale: 1.4,
          stagger: { each: 0.03, from: 'random' },
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 20%', scrub: 0.6 },
        });
      }, el);
      destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
