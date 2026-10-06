import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiService } from '../../../core/api.service';
import { SITE } from '../../../core/site.config';
import { TPipe, t } from '../../../core/i18n';
import { MagneticDirective } from '../../../shared/magnetic.directive';
import { SplitDirective } from '../../../shared/split.directive';

const BUDGETS = ['< 2k €', '2 – 5k €', '5 – 15k €', '15k € +'];
const SERVICES = [
  { id: 'design', label: t('work.design') },
  { id: 'dev', label: t('work.dev') },
  { id: 'both', label: t('contact.both') },
];

type Field = 'name' | 'email' | 'company' | 'message';

@Component({
  selector: 'app-contact',
  imports: [TPipe, ReactiveFormsModule, SplitDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly api = inject(ApiService);
  protected readonly site = SITE;
  protected readonly budgets = BUDGETS;
  protected readonly services = SERVICES;

  protected readonly status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  protected readonly serverErrors = signal<Partial<Record<Field, string>>>({});

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    service: [''],
    budget: [''],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
    website: [''], // piège à bots, masqué
  });

  protected error(field: Field): string | null {
    const c = this.form.controls[field];
    const server = this.serverErrors()[field];
    if (server) return server;
    if (!c.touched || c.valid) return null;
    if (c.hasError('required')) return t('err.required');
    if (c.hasError('email')) return t('err.email');
    if (c.hasError('minlength')) return t('err.min');
    return t('err.invalid');
  }

  submit() {
    this.serverErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first = Object.keys(this.form.controls).find((k) => this.form.get(k)?.invalid);
      document.getElementById('f-' + first)?.focus();
      return;
    }

    this.status.set('sending');
    this.api.sendContact(this.form.getRawValue()).subscribe({
      next: () => {
        this.status.set('sent');
        this.form.reset();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 && err.error) {
          const errs: Partial<Record<Field, string>> = {};
          for (const [k, v] of Object.entries(err.error)) errs[k as Field] = (v as string[])[0];
          this.serverErrors.set(errs);
          this.status.set('idle');
        } else {
          this.status.set('error');
        }
      },
    });
  }
}
