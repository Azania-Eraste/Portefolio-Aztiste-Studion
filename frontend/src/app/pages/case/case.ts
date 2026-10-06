import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { ApiService, CaseStudy, initials } from '../../core/api.service';
import { Key, TPipe, t } from '../../core/i18n';
import { MotionService } from '../../core/motion.service';
import { Brush } from '../../shared/brush';
import { RevealDirective } from '../../shared/reveal.directive';
import { Footer } from '../home/sections/footer';

/** Étude de cas d'un projet : /projets/:slug */
@Component({
  selector: 'app-case',
  imports: [RouterLink, TPipe, Brush, RevealDirective, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './case.html',
  styleUrl: './case.scss',
})
export class Case {
  /** Lié au paramètre de route :slug */
  readonly slug = input.required<string>();

  private readonly api = inject(ApiService);
  protected readonly motion = inject(MotionService);
  protected readonly initials = initials;

  protected readonly project = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.api.project(params),
  });

  protected chapters(p: CaseStudy) {
    const all: [Key, string][] = [
      ['case.context', p.context],
      ['case.approach', p.approach],
      ['case.result', p.result],
    ];
    return all.filter(([, text]) => text);
  }

  constructor() {
    const title = inject(Title);
    effect(() => {
      const p = this.project.hasValue() ? this.project.value() : undefined; // value() lève une erreur sur un 404
      title.setTitle(p ? t('case.title', { title: p.title }) : t('meta.title'));
    });
  }
}
