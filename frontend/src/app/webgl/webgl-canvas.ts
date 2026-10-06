import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

import { MotionService } from '../core/motion.service';
import type { ParticleScene } from './particle-scene';

@Component({
  selector: 'app-webgl-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas aria-hidden="true" [style.opacity]="opacity()"></canvas>`,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }
    canvas {
      width: 100%;
      height: 100%;
      transition: opacity 0.8s var(--ease-out);
    }
  `,
})
export class WebglCanvas {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly motion = inject(MotionService);
  private scene?: ParticleScene;
  private readonly onHome = toSignal(
    inject(Router).events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects.split(/[?#]/)[0] === '/'),
    ),
    { initialValue: location.pathname === '/' },
  );

  /** Le nuage s'efface pendant la lecture des sections centrales. */
  protected readonly opacity = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(async () => {
      const el = this.canvas().nativeElement;
      try {
        const { ParticleScene } = await import('./particle-scene');
        const mobile = innerWidth < 768;
        this.scene = new ParticleScene(el, {
          count: mobile ? 3500 : 9000,
          reduced: this.motion.reduced,
        });
      } catch {
        return; // Pas de WebGL : le site reste lisible sans le nuage
      } finally {
        document.documentElement.dataset['webgl'] = 'ready'; // lu par le préchargeur
      }

      const scene = this.scene;
      const onPointer = (e: PointerEvent) =>
        scene.setPointer((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      const onResize = () => scene.resize();
      const onVisibility = () => (document.hidden ? scene.pause() : scene.play());

      addEventListener('pointermove', onPointer, { passive: true });
      addEventListener('resize', onResize);
      document.addEventListener('visibilitychange', onVisibility);
      scene.play();

      destroyRef.onDestroy(() => {
        removeEventListener('pointermove', onPointer);
        removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        scene.dispose();
      });
    });

    effect(() => {
      const p = this.motion.progress();
      const ready = this.motion.ready();
      const hero = Math.min(1, scrollY / (innerHeight * 0.9));
      const outro = Math.max(0, Math.min(1, (p - 0.86) / 0.14));
      this.scene?.setMorph(hero * (1 - outro));
      const base = !ready ? 0 : outro > 0 ? 0.75 : hero < 1 ? 1 : 0.28;
      this.opacity.set(this.onHome() ? base : Math.min(base, 0.12));
    });
  }
}
