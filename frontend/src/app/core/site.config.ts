import { pick, t } from './i18n';

/**
 * Infos du studio affichées en dur dans le site.
 * Les projets, compétences et expériences, eux, viennent de l'admin Django.
 */
export const SITE = {
  name: 'Aztiste Studio',
  logoLabel: 'L’aztiste',
  tagline: t('site.tagline'),
  season: '2026 — 2027',
  location: t('site.location'),
  timezone: 'Africa/Abidjan',
  email: 'kouadioazania@gmail.com',
  // Domaine déclaré sur plausible.io (statistiques sans cookies). Vide = aucun suivi.
  plausibleDomain: '',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/azania-kouadio/' },
    { label: 'GitHub', href: 'https://github.com/Azania-Eraste' },
  ],
  nav: [
    { id: 'studio', label: t('nav.studio'), index: '01' },
    { id: 'work', label: t('nav.work'), index: '02' },
    { id: 'expertise', label: t('nav.expertise'), index: '03' },
    { id: 'path', label: t('nav.path'), index: '04' },
    { id: 'contact', label: t('nav.contact'), index: '05' },
  ],
} as const;

export type PoleId = 'design' | 'dev';

/** Les deux pôles du studio. */
export const POLES: {
  id: PoleId;
  index: string;
  title: string;
  short: string;
  pitch: string;
  services: string[];
}[] = [
  {
    id: 'design',
    index: 'A',
    title: t('pole.design'),
    short: 'Design',
    pitch: pick({
      fr: 'Donner une image juste et mémorable : de la première esquisse du logo jusqu’au dernier fichier d’impression.',
      en: 'A fair and memorable image, from the first logo sketch to the last print file.',
    }),
    services: pick({
      fr: ['Identité visuelle & logo', 'Charte graphique', 'Print, affiche, packaging', 'Réseaux sociaux', 'UI / maquettes'],
      en: ['Visual identity & logo', 'Brand guidelines', 'Print, posters, packaging', 'Social media', 'UI / mockups'],
    }),
  },
  {
    id: 'dev',
    index: 'B',
    title: t('pole.dev'),
    short: 'Code',
    pitch: pick({
      fr: 'Transformer cette image en produit qui fonctionne : rapide, accessible, maintenable, et beau à utiliser.',
      en: 'Turning that image into a product that works: fast, accessible, maintainable and a pleasure to use.',
    }),
    services: pick({
      fr: ['Applications mobiles (Flutter)', 'API & back-office (Django)', 'Applications web (Angular)', 'Sites vitrines & e-commerce', 'Déploiement & maintenance'],
      en: ['Mobile apps (Flutter)', 'APIs & back offices (Django)', 'Web applications (Angular)', 'Brochure sites & e-commerce', 'Deployment & maintenance'],
    }),
  },
];
