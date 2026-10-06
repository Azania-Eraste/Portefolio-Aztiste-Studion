import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ApiService, initials } from '../../../core/api.service';
import { TPipe } from '../../../core/i18n';
import { MotionService } from '../../../core/motion.service';
import { PoleFilter } from '../../../core/pole-filter';
import { Brush } from '../../../shared/brush';

/**
 * Travaux — inspiré de danielkiss.hu : section épinglée, carrousel incurvé
 * piloté par le scroll (desktop). Mobile / mouvement réduit : défilement natif.
 */
@Component({
  selector: 'app-work',
  imports: [RouterLink, TPipe, Brush],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work {
  private readonly api = inject(ApiService);
  private readonly motion = inject(MotionService);
  private readonly pin = viewChild<ElementRef<HTMLElement>>('pin');
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  protected readonly filter = inject(PoleFilter);
  protected readonly state = this.api.projects;
  protected readonly initials = initials;
  protected readonly filters = [
    { id: 'all', label: 'work.all' },
    { id: 'design', label: 'work.design' },
    { id: 'dev', label: 'work.dev' },
  ] as const;

  protected readonly visible = computed(() => {
    const f = this.filter.value();
    const all = this.state().data;
    return f === 'all' ? all : all.filter((p) => p.pole === f);
  });

  protected countFor(id: 'all' | 'design' | 'dev') {
    const all = this.state().data;
    return id === 'all' ? all.length : all.filter((p) => p.pole === id).length;
  }

  protected pad = (n: number) => String(n).padStart(2, '0');

  constructor() {
    let mm: gsap.MatchMedia | undefined;
    inject(DestroyRef).onDestroy(() => mm?.revert());

    // (Re)construit l'épinglage à chaque changement de liste (filtre, données)
    afterRenderEffect(() => {
      this.visible();
      const pin = this.pin()?.nativeElement;
      const vp = this.viewport()?.nativeElement;
      const track = this.track()?.nativeElement;
      mm?.revert();
      if (!pin || !vp || !track) return;

      mm = gsap.matchMedia();
      mm.add('(min-width: 901px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        const cards = [...track.querySelectorAll<HTMLElement>('.card')];
        const distance = () => Math.max(0, track.scrollWidth - vp.clientWidth);

        // Chaque carte pivote selon sa distance au centre : paroi de cylindre
        const curve = () => {
          const mid = innerWidth / 2;
          for (const c of cards) {
            const r = c.getBoundingClientRect();
            const d = gsap.utils.clamp(-1.6, 1.6, (r.left + r.width / 2 - mid) / mid);
            gsap.set(c, { rotateY: d * -26, z: -Math.abs(d) * 140, yPercent: Math.abs(d) * 4 });
          }
        };

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            pin: true,
            start: 'top top',
            end: () => '+=' + distance() * 1.1,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: curve,
            onRefresh: curve,
          },
        });
        curve();

        // Clavier : une carte qui reçoit le focus est ramenée au centre de l'écran
        const onFocus = (e: FocusEvent) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>('.card');
          const st = tween.scrollTrigger;
          if (!card || !st || !distance()) return;
          const x = gsap.utils.clamp(0, distance(), card.offsetLeft - (vp.clientWidth - card.offsetWidth) / 2);
          this.motion.scrollToY(st.start + (x / distance()) * (st.end - st.start));
        };
        track.addEventListener('focusin', onFocus);
        return () => track.removeEventListener('focusin', onFocus);
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }
}
