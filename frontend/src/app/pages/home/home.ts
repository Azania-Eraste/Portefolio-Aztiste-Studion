import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Contact } from './sections/contact';
import { Expertise } from './sections/expertise';
import { Footer } from './sections/footer';
import { Hero } from './sections/hero';
import { Intro } from './sections/intro';
import { Marquee } from './sections/marquee';
import { Path } from './sections/path';
import { Studio } from './sections/studio';
import { Work } from './sections/work';

@Component({
  selector: 'app-home',
  imports: [Hero, Intro, Marquee, Studio, Work, Expertise, Path, Contact, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero />
    <app-intro />
    <app-marquee />
    <app-studio />
    <app-work />
    <app-expertise />
    <app-path />
    <app-contact />
    <app-footer />
  `,
})
export class Home {}
