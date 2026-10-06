import { Injectable, signal } from '@angular/core';

import type { PoleId } from './site.config';

/** Filtre de la liste de projets, partagé entre la section Pôles et la section Projets. */
@Injectable({ providedIn: 'root' })
export class PoleFilter {
  readonly value = signal<PoleId | 'all'>('all');
}
