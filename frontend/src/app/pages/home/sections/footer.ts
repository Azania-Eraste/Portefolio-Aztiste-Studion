import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MotionService } from '../../../core/motion.service';
import { SITE } from '../../../core/site.config';
import { Clock } from '../../../layout/clock';
import { ScrambleDirective } from '../../../shared/scramble.directive';
import { TPipe } from '../../../core/i18n';

@Component({
  selector: 'app-footer',
  imports: [TPipe, ScrambleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="cols">
        <div>
          <p class="label">{{ 'footer.time' | t }}</p>
          <p class="mono">{{ clock.time() }} — {{ site.timezone }}</p>
        </div>
        <nav [attr.aria-label]="'footer.social' | t">
          <p class="label">{{ 'footer.social' | t }}</p>
          <ul>
            @for (s of site.socials; track s.label) {
              <li><a class="mono" [href]="s.href" target="_blank" rel="noopener" appScramble>{{ s.label }} ↗</a></li>
            }
          </ul>
        </nav>
        <div>
          <p class="label">{{ 'footer.poles' | t }}</p>
          <p class="mono">A — {{ 'pole.design' | t }}<br />B — {{ 'pole.dev' | t }}</p>
        </div>
        <button class="mono top" type="button" (click)="motion.scrollTo('top')" appScramble>{{ 'footer.top' | t }}</button>
      </div>

      <div class="giant" aria-hidden="true"><span class="logo-mark"></span></div>
      <p class="legal mono">© {{ year }} {{ site.name }} — {{ 'footer.rights' | t }}</p>
    </footer>
  `,
  styles: `
    .footer {
      position: relative;
      z-index: 2;
      padding: 64px var(--gutter) 24px;
      border-top: 1px solid var(--line);
      overflow: hidden;
    }
    .cols {
      position: relative;
      z-index: 1;
      padding: 24px;
      background: var(--bg);
      border: 1px solid var(--line);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      align-items: start;
      p {
        margin: 0 0 8px;
      }
      ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      a {
        display: inline-flex;
        align-items: center;
        min-height: 36px;
      }
    }
    .top {
      justify-self: end;
      min-height: 44px;
    }
    .giant {
      margin: clamp(48px, 10vh, 120px) 0 0;
      color: rgba(242, 242, 236, 0.1);
      transition: color 0.8s var(--ease-out);
      .logo-mark {
        display: block;
        width: 100%;
      }
      &:hover {
        color: var(--accent);
      }
    }
    .legal {
      margin: 24px 0 0;
      color: var(--muted);
    }
    @media (max-width: 767px) {
      .cols {
        grid-template-columns: 1fr 1fr;
      }
      .top {
        justify-self: start;
      }
    }
  `,
})
export class Footer {
  protected readonly site = SITE;
  protected readonly clock = inject(Clock);
  protected readonly motion = inject(MotionService);
  protected readonly year = new Date().getFullYear();
}
