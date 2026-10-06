import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';
import { LANG, t } from './app/core/i18n';
import { SITE } from './app/core/site.config';

document.documentElement.lang = LANG;
document.title = t('meta.title');

// Statistiques sans cookies, seulement si un domaine Plausible est configuré
if (SITE.plausibleDomain) {
  const s = document.createElement('script');
  s.defer = true;
  s.dataset['domain'] = SITE.plausibleDomain;
  s.src = 'https://plausible.io/js/script.js';
  document.head.append(s);
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
