import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import gsap from 'gsap';

import { MotionService } from '../core/motion.service';

/**
 * Découpe le texte en mots masqués qui montent à l'entrée dans le viewport.
 * `appSplit="hero"` attend la fin du préchargeur au lieu du scroll.
 */
@Directive({ selector: '[appSplit]' })
export class SplitDirective {
  readonly appSplit = input<'' | 'hero'>('');
  readonly splitDelay = input(0);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const label = this.el.textContent?.trim() ?? '';
      this.split(this.el);
      // Le texte découpé est masqué aux lecteurs d'écran : on garde une copie lisible d'un seul tenant
      const sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.textContent = label;
      this.el.prepend(sr);
      if (this.motion.reduced) return;

      const words = this.el.querySelectorAll<HTMLElement>('.split-i');
      gsap.set(words, { yPercent: 110 });

      const play = () =>
        gsap.to(words, {
          yPercent: 0,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.06,
          delay: this.splitDelay(),
        });

      if (this.appSplit() === 'hero') {
        if (this.motion.ready()) return void play();
        window.addEventListener('app:ready', play, { once: true });
        destroyRef.onDestroy(() => window.removeEventListener('app:ready', play));
      } else {
        const ctx = gsap.context(() => {
          gsap.to(words, {
            yPercent: 0,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.05,
            delay: this.splitDelay(),
            scrollTrigger: { trigger: this.el, start: 'top 88%', once: true },
          });
        });
        destroyRef.onDestroy(() => ctx.revert());
      }
    });
  }

  /** Remplace chaque nœud texte par des spans mot, en gardant les éléments enfants (<em>, <br>…). */
  private split(node: Node) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of (child.textContent ?? '').split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(document.createTextNode(' '));
            continue;
          }
          const w = document.createElement('span');
          w.className = 'split-w';
          w.setAttribute('aria-hidden', 'true');
          const i = document.createElement('span');
          i.className = 'split-i';
          i.textContent = part;
          w.append(i);
          frag.append(w);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== 'BR') {
        (child as Element).setAttribute('aria-hidden', 'true');
        this.split(child);
      }
    }
  }
}
