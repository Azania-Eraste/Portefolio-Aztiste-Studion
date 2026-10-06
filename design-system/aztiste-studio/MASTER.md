# Design System — Aztiste Studio

> Source de vérité du site. Les valeurs ci-dessous sont celles réellement en production
> (`frontend/src/styles.scss`). Une page qui a besoin d'une exception la documente dans
> `design-system/aztiste-studio/pages/<page>.md`.

**Mis à jour :** 2026-10-06 · **Base :** génération UI UX Pro Max du 2026-10-05 (Brutalism, dark), adaptée.
**Positionnement :** studio à deux pôles — **A · Design graphique** et **B · Développement logiciel**.

---

## Couleurs

| Rôle | Valeur | Token |
|------|--------|-------|
| Fond | `#050505` | `--bg` |
| Fond surélevé (cartes, panneaux) | `#0c0c0c` | `--bg-raised` |
| Texte | `#f2f2ec` | `--fg` |
| Texte secondaire | `#8f8f88` (6.4:1 sur le fond) | `--muted` |
| Filets | `rgba(242,242,236,.14)` | `--line` |
| Filets appuyés | `rgba(242,242,236,.32)` | `--line-strong` |
| **Accent (marque)** | **`#ff6e10`** | `--accent` |
| Texte sur accent | `#050505` | `--accent-ink` |
| Erreur | `#ff5b4a` | `--danger` |

Règles : l'orange est **rare** — un mot par titre, l'état actif, le CTA principal. Jamais de texte orange
sur fond clair. Les visuels générés de projets utilisent la couleur `accent` du projet (admin Django).

## Typographie

| Usage | Police | Réglages |
|-------|--------|----------|
| Titres (`.display`) | Archivo variable | 800, `wdth 125`, capitales, interlignage 0.86 |
| Texte | Space Grotesk | 16px min, interlignage 1.55 |
| Labels, méta (`.mono`, `.label`) | JetBrains Mono | 12px, capitales, +0.04em |
| Annotations manuscrites | Permanent Marker (`--font-hand`) | 1 annotation max par écran |

Logo : mot-symbole « L'aztiste » (`.logo-mark`, masque CSS qui prend `currentColor`). Favicon : monogramme « az » orange sur noir.

## Mise en page

- Gouttière : `--gutter` = `clamp(16px, 3vw, 40px)` ; espacement de section `--section-y`.
- Grille 12 colonnes pour les en-têtes de section ; angles vifs (0–6px), filets 1px visibles.
- Desktop : cadre « plan de travail » (règles graduées, repères de coins, lecture X/Y/P/S).

## Mouvement

| Élément | Règle |
|---------|-------|
| Easing standard | `cubic-bezier(.16,1,.3,1)` (`--ease-out`), 0.5–1.2 s |
| Scroll | Lenis + GSAP ScrollTrigger |
| Titres | mots qui montent (`appSplit`), lettres floues qui se recomposent (intro) |
| Pinceau | `app-brush` : trait SVG qui se dessine à l'entrée dans l'écran |
| Travaux | section épinglée, carrousel incurvé (desktop uniquement) |
| Changement de page | View Transitions natives : la carte devient la couverture de l'étude de cas |
| Curseur | **un seul style** : point + anneau ; étiquette inclinée orange sur `[data-cursor]` |
| Grain | statique (pas d'animation permanente) |

Sous `prefers-reduced-motion` : pas de Lenis, pas de scrub ni d'épinglage, pas de transition de page ;
chaque section s'affiche dans son état final. Sur tactile : pas de curseur, carrousel en défilement natif.

## Bilingue

FR / EN via `core/i18n.ts` (pipe `| t`, fonction `t()`, `pick()` pour les listes). Langue = choix mémorisé,
sinon langue du navigateur. Contenu Django : champs `*_en`, l'API répond selon `?lang=`.

## À ne pas faire

- Ajouter un effet de plus sans en retirer un : le site en porte déjà beaucoup.
- Plus d'une annotation manuscrite ou d'un mot orange par écran.
- Masquer le contenu sous le curseur ou derrière le header fixe.
- Texte < 12px, contraste < 4.5:1, focus invisible, cibles < 44px.
- Emojis comme icônes.

## Checklist avant livraison

- [ ] Rendu vérifié à 390px et 1440px, aucun défilement horizontal
- [ ] Navigation clavier complète (y compris les cartes du carrousel épinglé)
- [ ] `prefers-reduced-motion` respecté
- [ ] Textes présents en FR **et** EN
- [ ] Lighthouse accessibilité ≥ 95
