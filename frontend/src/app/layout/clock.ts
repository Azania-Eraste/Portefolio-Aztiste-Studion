import { DestroyRef, Injectable, inject, signal } from '@angular/core';

import { SITE } from '../core/site.config';

/** Heure locale du studio, rafraîchie chaque seconde. */
@Injectable({ providedIn: 'root' })
export class Clock {
  private readonly fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: SITE.timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  readonly time = signal(this.fmt.format(new Date()));

  constructor() {
    const id = setInterval(() => this.time.set(this.fmt.format(new Date())), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
