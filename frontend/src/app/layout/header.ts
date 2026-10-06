import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MotionService } from '../core/motion.service';
import { SITE } from '../core/site.config';
import { ScrambleDirective } from '../shared/scramble.directive';
import { Clock } from './clock';
import { TPipe, LANG, setLang } from '../core/i18n';

@Component({
  selector: 'app-header',
  imports: [TPipe, ScrambleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'menuOpen.set(false)' },
  template: `
    <div class="progress" aria-hidden="true" [style.transform]="'scaleX(' + motion.progress() + ')'"></div>

    <header class="bar">
      <a class="logo" href="/" (click)="home($event)" [attr.aria-label]="'header.home' | t">
        <span class="logo-mark" aria-hidden="true"></span>
      </a>

      <span class="mono meta">{{ site.season }} <span class="sep">/</span> {{ clock.time() }}</span>

      <nav class="nav" [attr.aria-label]="'header.nav' | t">
        @for (item of site.nav; track item.id) {
          <a class="mono" [href]="'#' + item.id" (click)="go($event, item.id)" appScramble>
            <span class="idx">{{ item.index }}</span>{{ item.label }}
          </a>
        }
      </nav>

      <button
        class="menu-btn mono"
        type="button"
        [attr.aria-expanded]="menuOpen()"
        aria-controls="mobile-menu"
        (click)="menuOpen.set(!menuOpen())"
      >
        {{ (menuOpen() ? 'header.close' : 'header.menu') | t }}
      </button>

      <button class="lang mono" type="button" (click)="switchLang()" [attr.aria-label]="'header.lang' | t" [attr.lang]="other">
        {{ other.toUpperCase() }}
      </button>
    </header>

    <div id="mobile-menu" class="overlay" [class.open]="menuOpen()" [attr.inert]="menuOpen() ? null : ''">
      <nav [attr.aria-label]="'header.navMobile' | t">
        @for (item of site.nav; track item.id) {
          <a class="display" [href]="'#' + item.id" (click)="go($event, item.id)">
            <span class="mono idx">{{ item.index }}</span>{{ item.label }}
          </a>
        }
      </nav>
      <a class="mono accent" [href]="'mailto:' + site.email">{{ site.email }}</a>
    </div>
  `,
  styles: `
    .progress {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 120;
      height: 2px;
      background: var(--accent);
      transform-origin: left;
    }
    .bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 110;
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 28px var(--gutter) 20px;
      mix-blend-mode: difference;
      color: #fff;
    }
    .logo {
      display: flex;
      align-items: center;
      min-height: 44px;
      .logo-mark {
        height: 26px;
      }
    }
    .meta {
      margin-right: auto;
      opacity: 0.7;
      .sep {
        margin: 0 6px;
      }
    }
    .nav {
      display: flex;
      gap: 28px;
      a {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        position: relative;
        &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 10px;
          height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.5s var(--ease-out);
        }
        &:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      }
    }
    .idx {
      margin-right: 6px;
      opacity: 0.5;
    }
    .lang {
      min-width: 44px;
      min-height: 44px;
      border: 1px solid currentColor;
      border-radius: 999px;
    }
    .menu-btn {
      display: none;
      min-height: 44px;
      min-width: 44px;
    }
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 105;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 32px;
      padding: 96px var(--gutter) 40px;
      background: var(--bg);
      clip-path: inset(0 0 100% 0);
      transition: clip-path 0.8s var(--ease-in-out);
      &.open {
        clip-path: inset(0);
      }
      nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .display {
        font-size: clamp(44px, 13vw, 96px);
        display: flex;
        align-items: baseline;
        gap: 12px;
      }
    }
    @media (max-width: 900px) {
      .nav,
      .meta {
        display: none;
      }
      .logo {
        margin-right: auto;
      }
      .menu-btn {
        display: block;
      }
    }
    @media (min-width: 901px) {
      .overlay {
        display: none;
      }
    }
  `,
})
export class Header {
  protected readonly site = SITE;
  protected readonly motion = inject(MotionService);
  protected readonly clock = inject(Clock);
  protected readonly menuOpen = signal(false);
  protected readonly other = LANG === 'fr' ? 'en' : 'fr';
  private readonly router = inject(Router);

  /** Logo : retour à l'accueil depuis une étude de cas, sinon en haut de page. */
  home(e: Event) {
    e.preventDefault();
    this.menuOpen.set(false);
    if (this.router.url.split('#')[0] !== '/') this.router.navigateByUrl('/');
    else this.motion.scrollTo('top');
  }

  switchLang() {
    setLang(this.other);
  }

  go(e: Event, id: string) {
    e.preventDefault();
    this.menuOpen.set(false);
    this.motion.scrollTo(id);
  }
}
