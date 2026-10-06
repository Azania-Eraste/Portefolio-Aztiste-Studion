import { Directive, ElementRef, inject } from '@angular/core';

import { MotionService } from '../core/motion.service';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF';

/**
 * Effet « décryptage » : au survol, le texte passe par des glyphes aléatoires
 * puis se recompose de gauche à droite. Le nom accessible reste stable.
 */
@Directive({
  selector: '[appScramble]',
  host: { '(mouseenter)': 'run()', '(focus)': 'run()' },
})
export class ScrambleDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private original = '';
  private frame = 0;

  run() {
    if (this.motion.reduced) return;
    // On cible le dernier nœud texte pour ne pas écraser d'éventuels enfants (icônes…)
    const target = this.textTarget();
    if (!target) return;
    this.original ||= target.textContent ?? '';
    if (!this.el.hasAttribute('aria-label')) this.el.setAttribute('aria-label', this.el.textContent?.trim() ?? '');

    cancelAnimationFrame(this.frame);
    const text = this.original;
    let tick = 0;
    const total = text.length * 2.2;

    const step = () => {
      const revealed = Math.floor((tick / total) * text.length);
      target.textContent = text
        .split('')
        .map((c, i) => (i < revealed || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join('');
      if (tick++ < total) this.frame = requestAnimationFrame(step);
      else target.textContent = text;
    };
    step();
  }

  private textTarget(): Text | null {
    const walker = document.createTreeWalker(this.el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    let last: Text | null = null;
    while (walker.nextNode()) last = walker.currentNode as Text;
    return last;
  }
}
