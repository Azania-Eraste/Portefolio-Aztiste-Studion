import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { LANG } from './i18n';

export interface Project {
  id: number;
  title: string;
  slug: string;
  client: string;
  year: number;
  pole: 'design' | 'dev';
  pole_label: string;
  category: string;
  summary: string;
  stack: string[];
  cover: string | null;
  accent: string;
  live_url: string;
  repo_url: string;
}

/** « Maison Wax » → « MW » : utilisé par les visuels générés. */
export const initials = (p: Pick<Project, 'title'>) =>
  p.title
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

export interface CaseStudy extends Project {
  role: string;
  context: string;
  approach: string;
  result: string;
  images: { url: string; caption: string; wide: boolean }[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export interface Experience {
  id: number;
  role: string;
  kind: 'work' | 'education' | 'side';
  kind_label: string;
  pole: 'design' | 'dev' | 'both';
  company: string;
  location: string;
  start: string;
  end: string | null;
  description: string;
}

export interface Skill {
  id: number;
  name: string;
  group: 'design' | 'frontend' | 'backend' | 'creative' | 'tooling';
  group_label: string;
  level: number;
}

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  website: string;
}

/** État d'une ressource chargée une fois au démarrage. */
export interface Remote<T> {
  status: 'loading' | 'ready' | 'error';
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  readonly projects = this.load<Project[]>('/api/projects/', []);
  readonly experiences = this.load<Experience[]>('/api/experiences/', []);
  readonly skills = this.load<Skill[]>('/api/skills/', []);

  project(slug: string): Observable<CaseStudy> {
    return this.http.get<CaseStudy>(`/api/projects/${encodeURIComponent(slug)}/`, { params: { lang: LANG } });
  }

  sendContact(payload: ContactPayload): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>('/api/contact/', payload);
  }

  private load<T>(url: string, empty: T) {
    const state = signal<Remote<T>>({ status: 'loading', data: empty });
    this.http.get<T>(url, { params: { lang: LANG } }).subscribe({
      next: (data) => state.set({ status: 'ready', data }),
      error: (_: HttpErrorResponse) => state.set({ status: 'error', data: empty }),
    });
    return state.asReadonly();
  }
}
