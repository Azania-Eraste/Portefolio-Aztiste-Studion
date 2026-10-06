import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/**
 * Point d'entrée unique pour le scroll et l'animation :
 * Lenis pour le smooth scroll, synchronisé sur le ticker GSAP.
 * Sous prefers-reduced-motion, pas de Lenis et pas d'animation liée au scroll.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  readonly coarse = matchMedia('(pointer: coarse)').matches;

  /** Progression du scroll sur toute la page, 0 → 1. */
  readonly progress = signal(0);
  /** Passe à true quand le préchargeur a fini sa sortie. */
  readonly ready = signal(false);

  private lenis?: Lenis;
  private readonly router = inject(Router);

  start() {
    if (!this.reduced) {
      this.lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
      this.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => this.lenis?.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      this.lenis.stop(); // bloqué pendant le préchargeur
    }

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      this.progress.set(max > 0 ? scrollY / max : 0);
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  unlock() {
    this.lenis?.start();
    this.ready.set(true);
    ScrollTrigger.refresh();
  }

  /**
   * Défile jusqu'à une section. Si elle n'existe pas sur la page courante (lien du header
   * depuis une étude de cas), on revient à l'accueil et on attend qu'elle soit montée.
   */
  async scrollTo(target: string | HTMLElement) {
    let el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el && typeof target === 'string') {
      await this.router.navigateByUrl('/');
      el = await waitFor(target);
      // Le routeur remet la page en haut juste après la navigation : on passe après lui,
      // et les sections épinglées doivent exister avant de mesurer.
      await new Promise((r) => setTimeout(r, 300));
      ScrollTrigger.refresh();
    }
    if (!el) return;
    if (this.lenis) {
      this.lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      el.scrollIntoView();
    }
    el.focus({ preventScroll: true });
  }

  /** Défile jusqu'à une position précise de la page. */
  scrollToY(y: number) {
    if (this.lenis) this.lenis.scrollTo(y, { duration: 0.8 });
    else scrollTo(0, y);
  }
}

/** Attend qu'un élément apparaisse dans le DOM (2 s max). */
function waitFor(id: string): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const check = () => {
      const el = document.getElementById(id);
      if (el) requestAnimationFrame(() => resolve(el)); // une frame de plus pour le rendu
      else if (performance.now() - t0 > 2000) resolve(null);
      else requestAnimationFrame(check);
    };
    check();
  });
}
