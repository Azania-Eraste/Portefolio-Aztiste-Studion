import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import gsap from 'gsap';

import { MotionService } from '../core/motion.service';

/** Fondu + montée à l'entrée dans le viewport. */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  readonly revealDelay = input(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (motion.reduced) return;
      const ctx = gsap.context(() => {
        gsap.from(el, {
          y: 48,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'expo.out',
          delay: this.revealDelay(),
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });
      destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
