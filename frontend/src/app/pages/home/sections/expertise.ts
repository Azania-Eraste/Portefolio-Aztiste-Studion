import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ApiService, Skill } from '../../../core/api.service';
import { RevealDirective } from '../../../shared/reveal.directive';
import { SplitDirective } from '../../../shared/split.directive';
import { TPipe } from '../../../core/i18n';

const SEGMENTS = 12;
const ORDER = ['design', 'frontend', 'backend', 'creative', 'tooling'];

@Component({
  selector: 'app-expertise',
  imports: [TPipe, SplitDirective, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section" id="expertise" tabindex="-1" aria-labelledby="expertise-title">
      <div class="section-head">
        <p class="label">{{ 'skills.label' | t }}</p>
        <h2 id="expertise-title" class="display" appSplit>Stack</h2>
      </div>

      @if (state().status === 'error') {
        <p class="label" role="alert">&gt; {{ 'skills.down' | t }}</p>
      }

      <div class="grid">
        @for (g of groups(); track g.key; let i = $index) {
          <div class="group" appReveal [revealDelay]="i * 0.08">
            <h3 class="mono">
              <span class="accent">[{{ i + 1 }}]</span> {{ g.label }}
            </h3>
            <ul>
              @for (s of g.skills; track s.id) {
                <li>
                  <span class="name">{{ s.name }}</span>
                  <span class="meter mono" role="img" [attr.aria-label]="'skills.level' | t: { n: s.level }">
                    <span class="on">{{ bar(s).on }}</span><span class="off">{{ bar(s).off }}</span>
                  </span>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
    }
    .group {
      padding: clamp(20px, 2.4vw, 36px);
      background: var(--bg);
    }
    h3 {
      margin: 0 0 32px;
      font-size: 13px;
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 0;
      border-top: 1px solid var(--line);
    }
    .name {
      font-size: 18px;
      font-weight: 500;
    }
    .meter {
      font-size: 11px;
      letter-spacing: 0.12em;
      .on {
        color: var(--accent);
      }
      .off {
        color: var(--line-strong);
      }
    }
  `,
})
export class Expertise {
  private readonly api = inject(ApiService);
  protected readonly state = this.api.skills;

  protected readonly groups = computed(() => {
    const map = new Map<string, { key: string; label: string; skills: Skill[] }>();
    for (const s of this.state().data) {
      if (!map.has(s.group)) map.set(s.group, { key: s.group, label: s.group_label, skills: [] });
      map.get(s.group)!.skills.push(s);
    }
    for (const g of map.values()) g.skills.sort((a, b) => b.level - a.level);
    return [...map.values()].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  });

  /** Jauge ASCII : ■■■■■■■■■□□□ */
  protected bar(s: Skill) {
    const on = Math.round((s.level / 100) * SEGMENTS);
    return { on: '■'.repeat(on), off: '■'.repeat(SEGMENTS - on) };
  }
}
