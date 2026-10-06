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
  location: t('site.location'), // TODO : ta ville (dans i18n.ts)
  timezone: 'Europe/Paris',
  email: 'hello@aztiste.studio', // TODO : ton adresse réelle
  // Domaine déclaré sur plausible.io (statistiques sans cookies). Vide = aucun suivi.
  plausibleDomain: '',
  socials: [
    // TODO : remplace par tes vrais liens
    { label: 'Behance', href: 'https://www.behance.net/' },
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    { label: 'Instagram', href: 'https://www.instagram.com/' },
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
      fr: ['Sites vitrines & e-commerce', 'Applications web (Angular)', 'API & back-office (Django)', 'Expériences 3D / WebGL', 'Maintenance & évolution'],
      en: ['Brochure sites & e-commerce', 'Web applications (Angular)', 'APIs & back offices (Django)', '3D / WebGL experiences', 'Maintenance & evolution'],
    }),
  },
];
