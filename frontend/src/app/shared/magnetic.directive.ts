import { Directive, ElementRef, inject, input } from '@angular/core';
import gsap from 'gsap';

import { MotionService } from '../core/motion.service';

/** L'élément est légèrement attiré par le pointeur, puis revient avec un ressort. */
@Directive({
  selector: '[appMagnetic]',
  host: { '(pointermove)': 'move($event)', '(pointerleave)': 'leave()' },
})
export class MagneticDirective {
  readonly strength = input(0.35);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);

  move(e: PointerEvent) {
    if (this.motion.reduced || this.motion.coarse) return;
    const r = this.el.getBoundingClientRect();
    gsap.to(this.el, {
      x: (e.clientX - (r.left + r.width / 2)) * this.strength(),
      y: (e.clientY - (r.top + r.height / 2)) * this.strength(),
      duration: 0.6,
      ease: 'power3.out',
    });
  }

  leave() {
    gsap.to(this.el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
  }
}
