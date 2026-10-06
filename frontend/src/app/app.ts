import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MotionService } from './core/motion.service';
import { Cursor } from './layout/cursor';
import { Frame } from './layout/frame';
import { Header } from './layout/header';
import { Loader } from './layout/loader';
import { WebglCanvas } from './webgl/webgl-canvas';
import { TPipe } from './core/i18n';

@Component({
  selector: 'app-root',
  imports: [TPipe, RouterOutlet, Loader, Cursor, Frame, Header, WebglCanvas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link mono" href="#main">{{ 'a11y.skip' | t }}</a>
    <app-loader />
    <app-cursor />
    <app-frame />
    <app-header />
    <app-webgl-canvas />
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
    <div class="grain" aria-hidden="true"></div>
  `,
})
export class App {
  constructor() {
    inject(MotionService).start();
  }
}
