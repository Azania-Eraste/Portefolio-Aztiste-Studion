import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';

import { ApiService } from '../../../core/api.service';
import { MotionService } from '../../../core/motion.service';
import { PoleFilter } from '../../../core/pole-filter';
import { POLES, PoleId } from '../../../core/site.config';
import { MagneticDirective } from '../../../shared/magnetic.directive';
import { RevealDirective } from '../../../shared/reveal.directive';
import { SplitDirective } from '../../../shared/split.directive';
import { TPipe, t } from '../../../core/i18n';

const MANIFESTO = t('studio.manifesto');

@Component({
  selector: 'app-studio',
  imports: [TPipe, SplitDirective, RevealDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section" id="studio" tabindex="-1" aria-labelledby="studio-title">
      <div class="section-head">
        <p class="label">{{ 'studio.label' | t }}</p>
        <h2 id="studio-title" class="display" appSplit>{{ 'studio.title' | t }}</h2>
      </div>

      <p class="manifesto" #manifesto>
        <span class="visually-hidden">{{ manifestoText }}</span>
        @for (w of words; track $index) {
          <span class="w" aria-hidden="true">{{ w }} </span>
        }
      </p>

      <div class="poles">
        @for (p of poles; track p.id; let i = $index) {
          <article class="pole" [class.dev]="p.id === 'dev'" appReveal [revealDelay]="i * 0.12"
            [attr.aria-labelledby]="'pole-' + p.id">
            <header>
              <span class="mono letter">{{ p.index }}</span>
              <span class="mono count">{{ 'studio.count' | t: { n: count(p.id) } }}</span>
            </header>

            <p class="big display" aria-hidden="true">{{ p.short }}</p>
            <h3 [id]="'pole-' + p.id">{{ p.title }}</h3>
            <p class="pitch">{{ p.pitch }}</p>

            <ul class="services">
              @for (s of p.services; track s) {
                <li><span class="mono accent" aria-hidden="true">+</span> {{ s }}</li>
              }
            </ul>

            <button type="button" class="cta mono" appMagnetic [strength]="0.2" [attr.data-cursor]="'cursor.details' | t"
              (click)="show(p.id)">
              {{ 'studio.cta' | t: { pole: p.short.toLowerCase() } }}
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4" />
              </svg>
            </button>
          </article>
        }
      </div>
    </section>
  `,
  styles: `
    .manifesto {
      margin: 0 0 clamp(64px, 12vh, 160px);
      max-width: 22ch;
      font-family: var(--font-display);
      font-weight: 500;
      font-size: clamp(32px, 5.2vw, 88px);
      line-height: 1.04;
      letter-spacing: -0.02em;
      margin-left: auto;
    }
    .w {
      color: var(--fg);
    }
    :host(.motion-ok) .w {
      color: rgba(242, 242, 236, 0.42); // ≥ 3:1, seuil AA du très grand texte
    }
    .poles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
    }
    .pole {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: clamp(24px, 3.4vw, 56px);
      background: var(--bg);
      overflow: hidden;
      transition: background 0.5s var(--ease-out);
      isolation: isolate;

      &:hover {
        background: var(--bg-raised);
        .big {
          color: var(--accent);
          -webkit-text-stroke-color: transparent;
          transform: translateY(-6px);
        }
      }
    }
    header {
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      .letter {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border: 1px solid var(--line-strong);
        border-radius: 50%;
        color: var(--fg);
      }
    }
    .big {
      margin: clamp(32px, 6vh, 72px) 0 8px;
      font-size: clamp(56px, 7.2vw, 132px);
      color: transparent;
      -webkit-text-stroke: 1px var(--line-strong);
      transition:
        color 0.6s var(--ease-out),
        transform 0.6s var(--ease-out);
    }
    h3 {
      margin: 0 0 16px;
      font-family: var(--font-display);
      font-size: clamp(24px, 2.4vw, 36px);
      font-weight: 700;
      font-stretch: 112%;
      text-transform: uppercase;
    }
    .pitch {
      margin: 0 0 32px;
      max-width: 40ch;
      color: var(--muted);
    }
    .services {
      margin: 0 0 40px;
      padding: 0;
      list-style: none;
      li {
        padding: 12px 0;
        border-top: 1px solid var(--line);
        font-size: 18px;
      }
      .mono {
        margin-right: 8px;
      }
    }
    .cta {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 48px;
      margin-top: auto;
      padding: 0 22px;
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      transition:
        background 0.3s,
        color 0.3s,
        border-color 0.3s;
      &:hover {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-ink);
      }
    }
    @media (max-width: 900px) {
      .poles {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class Studio {
  protected readonly manifestoText = MANIFESTO;
  protected readonly words = MANIFESTO.split(' ');
  protected readonly poles = POLES;
  private readonly manifesto = viewChild.required<ElementRef<HTMLElement>>('manifesto');
  private readonly api = inject(ApiService);
  private readonly filter = inject(PoleFilter);
  private readonly motion = inject(MotionService);

  private readonly counts = computed(() => {
    const projects = this.api.projects().data;
    return {
      design: projects.filter((p) => p.pole === 'design').length,
      dev: projects.filter((p) => p.pole === 'dev').length,
    };
  });

  protected count(id: PoleId) {
    return String(this.counts()[id]).padStart(2, '0');
  }

  show(id: PoleId) {
    this.filter.value.set(id);
    this.motion.scrollTo('work');
  }

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    // Les mots s'allument au fil du scroll
    afterNextRender(() => {
      if (this.motion.reduced) return;
      host.classList.add('motion-ok');
      const el = this.manifesto().nativeElement;
      const ctx = gsap.context(() => {
        gsap.to(el.querySelectorAll('.w'), {
          color: '#f2f2ec',
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
        });
      });
      destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
