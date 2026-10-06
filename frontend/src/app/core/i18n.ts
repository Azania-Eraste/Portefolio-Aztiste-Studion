import { Pipe, PipeTransform } from '@angular/core';

/**
 * Bilingue FR / EN. La langue est fixée au démarrage (choix mémorisé, sinon langue du
 * navigateur) ; en changer recharge la page. Aucune animation n'a donc à être rejouée.
 */
export type Lang = 'fr' | 'en';
const KEY = 'aztiste-lang';

export const LANG: Lang = (() => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    // stockage indisponible : on suit le navigateur
  }
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
})();

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // tant pis : la langue ne sera pas mémorisée
  }
  location.reload();
}

/** Pour les données structurées (listes, objets) : `pick({ fr: [...], en: [...] })`. */
export const pick = <T>(v: { fr: T; en: T }): T => v[LANG];

const fr = {
  'a11y.skip': 'Aller au contenu',
  'api.down': 'API indisponible. Lance le backend :',
  'cursor.view': 'Voir ↗',
  'cursor.details': 'Détails ↗',
  'cursor.case': 'Étude de cas',
  'cursor.write': 'Écrire',
  'meta.title': 'Aztiste Studio — Design graphique & développement logiciel',

  'site.tagline': 'Studio de design graphique & de développement logiciel',
  'site.location': 'Basé à Bonoua, Côte d’Ivoire — disponible partout',
  'nav.studio': 'Pôles',
  'nav.work': 'Projets',
  'nav.expertise': 'Expertise',
  'nav.path': 'Parcours',
  'nav.contact': 'Contact',
  'pole.design': 'Design graphique',
  'pole.dev': 'Développement logiciel',
  'pole.both': 'Design & développement',

  'header.home': 'L’aztiste — Aztiste Studio, retour à l’accueil',
  'header.nav': 'Navigation principale',
  'header.navMobile': 'Navigation mobile',
  'header.menu': 'Menu',
  'header.close': 'Fermer',
  'header.lang': 'Read this site in English',

  'loader.loading': 'Chargement du portfolio…',
  'loader.ready': 'Le site est prêt.',
  'loader.game': 'Mini-jeu facultatif : faites sauter le carré az par-dessus le code avec Espace ou en touchant l’écran.',
  'loader.enter': 'Le site est prêt — Entrer',
  'game.idle': 'ESPACE / TAP POUR JOUER PENDANT LE CHARGEMENT',
  'game.over': 'BUG DÉTECTÉ — ESPACE / TAP POUR RELANCER',

  'hero.h1': 'Aztiste Studio — design graphique et développement logiciel',
  'hero.poleA': 'A / Pôle design',
  'hero.poleB': 'B / Pôle développement',
  'hero.note': 'du logo jusqu’au code',
  'hero.lead': 'Studio de design graphique & de développement logiciel. Des identités qui marquent, des interfaces qui bougent, du code qui tient la charge.',
  'hero.available': 'Disponible pour vos projets',

  'intro.l1': 'Le dessiner,',
  'intro.l2': 'puis le coder…',
  'intro.sub': 'Une seule équipe, de l’esquisse au déploiement. Pas de perte entre l’intention et l’écran.',
  'intro.projects': 'Projets livrés',
  'intro.years': 'Années de pratique',
  'intro.poles': 'Pôles : design & code',
  'marquee.label': 'Savoir-faire',

  'studio.label': '01 — Le studio',
  'studio.title': 'Deux pôles',
  'studio.manifesto': 'Aztiste Studio réunit deux métiers sous un même toit : le design graphique et le développement logiciel. Une marque pensée de son logo jusqu’à son code, sans rien perdre entre l’intention et l’écran.',
  'studio.count': '{n} projets',
  'studio.cta': 'Voir les projets {pole}',

  'work.label': '02 — Projets sélectionnés',
  'work.ghost': 'Travaux',
  'work.t1': 'Dessiné. Codé.',
  'work.t2': 'Livré…',
  'work.filter': 'Filtrer par pôle',
  'work.all': 'Tous',
  'work.design': 'Design graphique',
  'work.dev': 'Développement',
  'work.shown': '{n} projets affichés',
  'work.tools': 'Outils',
  'work.read': 'Lire l’étude de cas',
  'work.total': 'Et au final,',
  'work.totalN': '{n} projets',
  'work.sign': 'Design graphique & développement. Par un seul studio.',

  'skills.label': '03 — Expertise',
  'skills.down': 'API indisponible — compétences non chargées.',
  'skills.level': 'Niveau {n} sur 100',

  'path.label': '04 — Parcours',
  'path.down': 'API indisponible — parcours non chargé.',
  'path.hintHover': 'Survoler une barre pour la développer',
  'path.hintTouch': 'Glisser · toucher pour développer',
  'path.legend': 'Légende',
  'path.work': 'Expérience',
  'path.side': 'Formation · freelance',
  'path.now': 'En cours',
  'path.today': 'Aujourd’hui',
  'path.todayLower': 'aujourd’hui',
  'path.short': 'auj.',
  'path.list': 'Parcours, du plus récent au plus ancien',
  'path.pole': 'Pôle',

  'contact.label': '05 — Contact',
  'contact.t1': 'Parlons de',
  'contact.t2': 'votre',
  'contact.t3': 'projet',
  'contact.direct': 'Écrire directement',
  'contact.hint': 'Réponse sous 48 h. Un logo, une affiche, un site ou une application : brief détaillé ou simple idée, tout est bienvenu.',
  'contact.done': 'Message reçu',
  'contact.thanks': 'Merci ! Je reviens vers vous très vite.',
  'contact.again': 'Envoyer un autre message',
  'contact.name': 'Nom *',
  'contact.email': 'Email *',
  'contact.company': 'Structure',
  'contact.need': 'Votre besoin',
  'contact.both': 'Les deux',
  'contact.budget': 'Budget estimé',
  'contact.message': 'Votre projet *',
  'contact.honeypot': 'Ne pas remplir',
  'contact.failed': 'L’envoi a échoué. Réessayez ou écrivez à {email}.',
  'contact.send': 'Envoyer',
  'contact.sending': 'Envoi…',
  'err.required': 'Champ requis.',
  'err.email': 'Adresse email invalide.',
  'err.min': 'Dites-m’en un peu plus (10 caractères minimum).',
  'err.invalid': 'Valeur invalide.',

  'footer.time': 'Heure locale',
  'footer.social': 'Réseaux',
  'footer.poles': 'Pôles',
  'footer.top': 'Retour en haut ↑',
  'footer.rights': 'Tous droits réservés',

  'case.label': 'Étude de cas',
  'case.loading': 'Chargement du projet…',
  'case.notFound': 'Ce projet est introuvable.',
  'case.back': '← Tous les projets',
  'case.client': 'Client',
  'case.year': 'Année',
  'case.role': 'Rôle',
  'case.category': 'Catégorie',
  'case.tools': 'Outils',
  'case.context': 'Contexte',
  'case.approach': 'Démarche',
  'case.result': 'Résultat',
  'case.gallery': 'Galerie',
  'case.visit': 'Voir le site ↗',
  'case.code': 'Voir le code ↗',
  'case.prev': 'Précédent',
  'case.next': 'Projet suivant',
  'case.title': '{title} — Étude de cas · Aztiste Studio',
};

export type Key = keyof typeof fr;

const en: Record<Key, string> = {
  'a11y.skip': 'Skip to content',
  'api.down': 'API unavailable. Start the backend:',
  'cursor.view': 'View ↗',
  'cursor.details': 'Details ↗',
  'cursor.case': 'Case study',
  'cursor.write': 'Write',
  'meta.title': 'Aztiste Studio — Graphic design & software development',

  'site.tagline': 'Graphic design & software development studio',
  'site.location': 'Based in Bonoua, Côte d’Ivoire — available worldwide',
  'nav.studio': 'Practices',
  'nav.work': 'Work',
  'nav.expertise': 'Expertise',
  'nav.path': 'Journey',
  'nav.contact': 'Contact',
  'pole.design': 'Graphic design',
  'pole.dev': 'Software development',
  'pole.both': 'Design & development',

  'header.home': 'L’aztiste — Aztiste Studio, back to home',
  'header.nav': 'Main navigation',
  'header.navMobile': 'Mobile navigation',
  'header.menu': 'Menu',
  'header.close': 'Close',
  'header.lang': 'Lire ce site en français',

  'loader.loading': 'Loading the portfolio…',
  'loader.ready': 'The site is ready.',
  'loader.game': 'Optional mini-game: make the az square jump over the code with Space or by tapping the screen.',
  'loader.enter': 'The site is ready — Enter',
  'game.idle': 'SPACE / TAP TO PLAY WHILE IT LOADS',
  'game.over': 'BUG FOUND — SPACE / TAP TO RETRY',

  'hero.h1': 'Aztiste Studio — graphic design and software development',
  'hero.poleA': 'A / Design practice',
  'hero.poleB': 'B / Development practice',
  'hero.note': 'from logo to code',
  'hero.lead': 'Graphic design & software development studio. Identities that stick, interfaces that move, code that holds up.',
  'hero.available': 'Available for projects',

  'intro.l1': 'Design it,',
  'intro.l2': 'then code it…',
  'intro.sub': 'One team, from first sketch to deployment. Nothing lost between intent and screen.',
  'intro.projects': 'Projects shipped',
  'intro.years': 'Years of practice',
  'intro.poles': 'Practices: design & code',
  'marquee.label': 'Skills',

  'studio.label': '01 — The studio',
  'studio.title': 'Two practices',
  'studio.manifesto': 'Aztiste Studio brings two crafts under one roof: graphic design and software development. A brand thought through from its logo to its code, with nothing lost between intent and screen.',
  'studio.count': '{n} projects',
  'studio.cta': 'See {pole} projects',

  'work.label': '02 — Selected work',
  'work.ghost': 'Work',
  'work.t1': 'Designed. Coded.',
  'work.t2': 'Shipped…',
  'work.filter': 'Filter by practice',
  'work.all': 'All',
  'work.design': 'Graphic design',
  'work.dev': 'Development',
  'work.shown': '{n} projects shown',
  'work.tools': 'Tools',
  'work.read': 'Read the case study',
  'work.total': 'All in all,',
  'work.totalN': '{n} projects',
  'work.sign': 'Graphic design & development. One studio.',

  'skills.label': '03 — Expertise',
  'skills.down': 'API unavailable — skills not loaded.',
  'skills.level': 'Level {n} out of 100',

  'path.label': '04 — Journey',
  'path.down': 'API unavailable — journey not loaded.',
  'path.hintHover': 'Hover a bar to expand it',
  'path.hintTouch': 'Swipe · tap to expand',
  'path.legend': 'Legend',
  'path.work': 'Experience',
  'path.side': 'Education · freelance',
  'path.now': 'Ongoing',
  'path.today': 'Today',
  'path.todayLower': 'today',
  'path.short': 'now',
  'path.list': 'Journey, most recent first',
  'path.pole': 'Practice',

  'contact.label': '05 — Contact',
  'contact.t1': 'Let’s talk about',
  'contact.t2': 'your',
  'contact.t3': 'project',
  'contact.direct': 'Write directly',
  'contact.hint': 'Reply within 48 hours. A logo, a poster, a website or an app: detailed brief or rough idea, all welcome.',
  'contact.done': 'Message received',
  'contact.thanks': 'Thank you! I’ll get back to you very soon.',
  'contact.again': 'Send another message',
  'contact.name': 'Name *',
  'contact.email': 'Email *',
  'contact.company': 'Company',
  'contact.need': 'What you need',
  'contact.both': 'Both',
  'contact.budget': 'Estimated budget',
  'contact.message': 'Your project *',
  'contact.honeypot': 'Leave empty',
  'contact.failed': 'Sending failed. Try again or write to {email}.',
  'contact.send': 'Send',
  'contact.sending': 'Sending…',
  'err.required': 'Required field.',
  'err.email': 'Invalid email address.',
  'err.min': 'Tell me a bit more (10 characters minimum).',
  'err.invalid': 'Invalid value.',

  'footer.time': 'Local time',
  'footer.social': 'Social',
  'footer.poles': 'Practices',
  'footer.top': 'Back to top ↑',
  'footer.rights': 'All rights reserved',

  'case.label': 'Case study',
  'case.loading': 'Loading the project…',
  'case.notFound': 'This project could not be found.',
  'case.back': '← All projects',
  'case.client': 'Client',
  'case.year': 'Year',
  'case.role': 'Role',
  'case.category': 'Category',
  'case.tools': 'Tools',
  'case.context': 'Context',
  'case.approach': 'Approach',
  'case.result': 'Outcome',
  'case.gallery': 'Gallery',
  'case.visit': 'Visit the site ↗',
  'case.code': 'View the code ↗',
  'case.prev': 'Previous',
  'case.next': 'Next project',
  'case.title': '{title} — Case study · Aztiste Studio',
};

const DICT = { fr, en };

/** `t('studio.count', { n: 3 })` → « 3 projets ». */
export function t(key: Key, vars?: Record<string, string | number>): string {
  let s = DICT[LANG][key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

@Pipe({ name: 't' })
export class TPipe implements PipeTransform {
  transform(key: Key, vars?: Record<string, string | number>): string {
    return t(key, vars);
  }
}
