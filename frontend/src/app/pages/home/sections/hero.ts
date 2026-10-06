import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MotionService } from '../../../core/motion.service';
import { SITE } from '../../../core/site.config';
import { Brush } from '../../../shared/brush';
import { MagneticDirective } from '../../../shared/magnetic.directive';
import { SplitDirective } from '../../../shared/split.directive';
import { TPipe } from '../../../core/i18n';

@Component({
  selector: 'app-hero',
  imports: [TPipe, SplitDirective, MagneticDirective, Brush],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="top">
        <p class="label">( Portfolio {{ site.season }} )</p>
        <p class="label right">{{ site.location }}</p>
      </div>

      <div class="title-wrap">
      <p class="note" [class.on]="motion.ready()" aria-hidden="true"><span class="arrow">↙</span> {{ 'hero.note' | t }}</p>
      <h1 id="hero-title" class="display title">
        <span class="visually-hidden">{{ 'hero.h1' | t }}</span>
        <span class="row" aria-hidden="true">
          <span class="pole mono">{{ 'hero.poleA' | t }}</span>
          <span appSplit="hero">Design</span>
        </span>
        <span class="row offset" aria-hidden="true">
          <span class="pole mono">{{ 'hero.poleB' | t }}</span>
          <span appSplit="hero" [splitDelay]="0.12"><span class="amp">&amp;</span> Code</span>
        </span>
      </h1>
      <app-brush class="stroke" />
      </div>

      <div class="bottom">
        <p class="lead" appSplit="hero" [splitDelay]="0.3">
          {{ 'hero.lead' | t }}
        </p>

        <p class="status mono">
          <span class="pulse" aria-hidden="true"></span>
          {{ 'hero.available' | t }} {{ site.season }}
        </p>

        <button class="scroll mono" type="button" (click)="motion.scrollTo('studio')" appMagnetic data-cursor="Go">
          Scroll
          <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true">
            <path d="M6 0v18M1 13l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.2" />
          </svg>
        </button>
      </div>
    </section>
  `,
  styles: `
    .hero {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-rows: auto 1fr auto;
      min-height: 100svh;
      padding: 96px var(--gutter) 32px;
    }
    .top {
      display: flex;
      justify-content: space-between;
      .right {
        text-align: right;
      }
    }
    .title-wrap {
      position: relative;
      align-self: center;
    }
    .note {
      position: absolute;
      top: -0.6em;
      right: 4%;
      margin: 0;
      font-family: var(--font-hand);
      font-size: clamp(18px, 2.2vw, 34px);
      transform: rotate(-4deg);
      opacity: 0;
      transition: opacity 0.8s 1s;
      .arrow {
        color: var(--accent);
        margin-right: 6px;
      }
    }
    .note.on {
      opacity: 1;
    }
    .stroke {
      width: 58%;
      margin: 0.08em 0 0 auto;
      font-size: clamp(56px, 16.4vw, 320px);
    }
    .title {
      margin: 0;
      font-size: clamp(56px, 16.4vw, 320px);
      .row {
        display: block;
        position: relative;
      }
      .offset {
        text-align: right;
      }
      .pole {
        position: absolute;
        top: 0.4em;
        font-size: 12px;
        letter-spacing: 0.04em;
        color: var(--muted);
        transform: translateY(-100%);
      }
      .offset .pole {
        right: 0;
      }
      .amp {
        color: var(--accent);
        font-stretch: 62%;
        font-variation-settings: 'wdth' 62;
        font-weight: 300;
      }
    }
    .bottom {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 16px;
      align-items: end;
    }
    .lead {
      grid-column: 1 / span 5;
      margin: 0;
      font-size: clamp(18px, 1.6vw, 24px);
      line-height: 1.35;
      max-width: 34ch;
    }
    .status {
      grid-column: 7 / span 4;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }
    .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 0 var(--accent);
      animation: pulse 2s infinite;
    }
    .scroll {
      grid-column: 12;
      justify-self: end;
      display: grid;
      place-items: center;
      gap: 8px;
      width: 88px;
      height: 88px;
      border: 1px solid var(--line-strong);
      border-radius: 50%;
      transition: background 0.3s, color 0.3s;
      &:hover {
        background: var(--accent);
        color: var(--accent-ink);
      }
    }
    @keyframes pulse {
      70% {
        box-shadow: 0 0 0 10px rgba(255, 110, 16, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(255, 110, 16, 0);
      }
    }
    @media (max-width: 767px) {
      .title .pole {
        position: static;
        display: block;
        margin: 20px 0 10px;
        transform: none;
        font-size: 11px;
        line-height: 1.4;
        color: var(--fg);
      }
      .top .right {
        display: none;
      }
      .lead,
      .status {
        grid-column: 1 / -1;
      }
      .scroll {
        display: none;
      }
    }
  `,
})
export class Hero {
  protected readonly site = SITE;
  protected readonly motion = inject(MotionService);
}
