import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';

import { ApiService, Experience } from '../../../core/api.service';
import { MotionService } from '../../../core/motion.service';
import { SplitDirective } from '../../../shared/split.directive';
import { TPipe, pick, t } from '../../../core/i18n';

const DAY = 86_400_000;
const POLE_BADGE = { design: 'A', dev: 'B', both: 'AB' } as const;

interface Bar {
  e: Experience;
  left: number; // % sur l'axe
  width: number; // % jusqu'à la fin (ou aujourd'hui)
  ongoing: boolean;
  years: string;
  duration: string;
}

/**
 * Timeline façon diagramme de Gantt (inspirée de bryangarage.dev) :
 * axe des années, une barre par expérience, repère « aujourd'hui »,
 * carte de détail au survol / focus / tap.
 */
@Component({
  selector: 'app-path',
  imports: [TPipe, SplitDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './path.html',
  styleUrl: './path.scss',
  host: { '(document:keydown.escape)': 'active.set(null)' },
})
export class Path {
  private readonly api = inject(ApiService);
  private readonly motion = inject(MotionService);
  protected readonly state = this.api.experiences;
  protected readonly badge = POLE_BADGE;

  private readonly gantt = viewChild<ElementRef<HTMLElement>>('gantt');
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  private readonly today = new Date();

  /** Bornes de l'axe : première année d'activité → année courante + 2. */
  protected readonly axis = computed(() => {
    const items = this.state().data;
    const first = items.length
      ? Math.min(...items.map((e) => new Date(e.start).getFullYear()))
      : this.today.getFullYear() - 4;
    const from = first - 1;
    const to = this.today.getFullYear() + 2;
    const years = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    return { from, to, years };
  });

  /** Plus récent en haut, comme un escalier qui monte vers aujourd'hui. */
  protected readonly bars = computed<Bar[]>(() => {
    const { from, to } = this.axis();
    const t0 = Date.UTC(from, 0, 1);
    const span = Date.UTC(to, 0, 1) - t0;
    const pct = (d: Date) => ((d.getTime() - t0) / span) * 100;

    return [...this.state().data]
      .sort((a, b) => b.start.localeCompare(a.start))
      .map((e) => {
        const start = new Date(e.start);
        const end = e.end ? new Date(e.end) : this.today;
        return {
          e,
          left: pct(start),
          width: Math.max(pct(end) - pct(start), 2),
          ongoing: !e.end,
          years: `${start.getFullYear()}–${e.end ? String(end.getFullYear()).slice(2) : t('path.short')}`,
          duration: this.duration(start, end),
        };
      });
  });

  protected readonly todayPct = computed(() => {
    const { from, to } = this.axis();
    const t0 = Date.UTC(from, 0, 1);
    return ((this.today.getTime() - t0) / (Date.UTC(to, 0, 1) - t0)) * 100;
  });

  protected yearPct(y: number) {
    const { from, to } = this.axis();
    return ((y - from) / (to - from)) * 100;
  }

  /** Entrée développée (survol, focus clavier ou tap). Sur mobile, l'actuelle par défaut. */
  protected readonly active = signal<number | null>(null);
  protected readonly shown = computed(() => {
    const id = this.active();
    return this.bars().find((b) => b.e.id === id) ?? null;
  });
  protected readonly panel = computed(() => this.shown() ?? this.bars()[0] ?? null);
  protected readonly cardPos = signal({ x: 0, right: 0, y: 0, flip: false });

  open(b: Bar, el: HTMLElement) {
    const host = this.gantt()?.nativeElement;
    if (host) {
      const h = host.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = r.left - h.left;
      this.cardPos.set({ x, right: h.right - r.right, y: r.top - h.top, flip: x > h.width - 380 });
    }
    this.active.set(b.e.id);
  }

  /** Sur écran tactile, le panneau reste sur la dernière entrée touchée. */
  close(b: Bar) {
    if (this.canHover && this.active() === b.e.id) this.active.set(null);
  }

  private readonly canHover = matchMedia('(hover: hover)').matches;

  private duration(a: Date, b: Date) {
    const months = Math.max(1, Math.round((b.getTime() - a.getTime()) / (DAY * 30.44)));
    const y = Math.floor(months / 12);
    const m = months % 12;
    const parts = [];
    const u = pick({ fr: { y: 'an', ys: 'ans', m: 'mois' }, en: { y: 'yr', ys: 'yrs', m: 'mo' } });
    if (y) parts.push(`${y} ${y > 1 ? u.ys : u.y}`);
    if (m) parts.push(`${m} ${u.m}`);
    return parts.join(' ');
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    let ctx: gsap.Context | undefined;
    destroyRef.onDestroy(() => ctx?.revert());

    // Les barres se dessinent de gauche à droite, la plus ancienne d'abord
    afterRenderEffect(() => {
      const bars = this.bars();
      const track = this.track()?.nativeElement;
      if (!track || !bars.length || ctx) return;

      // Frise défilante (mobile) : on démarre sur aujourd'hui, pas en 2019
      const sc = this.scroller()?.nativeElement;
      if (sc && sc.scrollWidth > sc.clientWidth) {
        sc.scrollLeft = (this.todayPct() / 100) * sc.scrollWidth - sc.clientWidth * 0.75;
      }
      if (this.motion.reduced) {
        ctx = gsap.context(() => {});
        return;
      }

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: track, start: 'top 75%', once: true } });
        tl.from(track.querySelectorAll('.year'), { autoAlpha: 0, y: 8, stagger: 0.04, duration: 0.5 })
          .from(track.querySelector('.today'), { scaleY: 0, transformOrigin: 'top', duration: 0.8, ease: 'expo.out' }, 0.2)
          .from(
            [...track.querySelectorAll('.bar')].reverse(),
            { scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'expo.out', stagger: 0.12 },
            0.3,
          )
          .from(track.querySelectorAll('.bar-inner'), { autoAlpha: 0, duration: 0.4, stagger: 0.12 }, 0.8);
      }, track);
    });
  }
}
