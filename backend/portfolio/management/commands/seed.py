"""Remplit la base avec du contenu de démonstration (à remplacer depuis l'admin)."""

from datetime import date

from django.core.management.base import BaseCommand

from portfolio.models import Experience, Project, Skill

PROJECTS = [
    dict(title='Nébula OS', slug='nebula-os', client='Projet démo', year=2026, pole='dev', order=1,
         category='WebGL', category_en='WebGL',
         summary='Interface spatiale pour piloter une flotte de satellites en temps réel. Rendu Three.js, shaders sur mesure, 60 fps sur mobile.',
         summary_en='A spatial interface to control a satellite fleet in real time. Three.js rendering, custom shaders, 60 fps on mobile.',
         role='Direction artistique, développement front & WebGL', role_en='Art direction, front-end & WebGL development',
         context='Les opérateurs suivaient leurs satellites sur des tableaux illisibles. Le brief : rendre la flotte compréhensible en un coup d’œil, sur grand écran comme sur tablette.',
         context_en='Operators tracked their satellites on unreadable spreadsheets. The brief: make the fleet understandable at a glance, on a wall screen as well as on a tablet.',
         approach='Une scène Three.js unique, des orbites dessinées en shaders, et une interface Angular pilotée par signals. Chaque donnée a été prototypée dans Figma avant d’être codée.',
         approach_en='A single Three.js scene, orbits drawn in shaders, and an Angular interface driven by signals. Every data view was prototyped in Figma before being coded.',
         result='Une interface temps réel à 60 fps, même sur tablette, et un temps de prise en main divisé par trois.',
         result_en='A real-time interface running at 60 fps, even on tablets, and onboarding time cut by three.',
         stack='Angular, Three.js, GLSL, Django', accent='#FF6E10'),
    dict(title='Maison Wax', slug='maison-wax', client='Projet démo', year=2026, pole='design', order=2,
         category='Identité visuelle', category_en='Visual identity',
         summary='Logo, palette et système graphique pour une marque textile. Déclinaisons étiquettes, packaging et réseaux sociaux.',
         summary_en='Logo, palette and graphic system for a textile brand. Applied to labels, packaging and social media.',
         role='Identité visuelle, charte graphique', role_en='Visual identity, brand guidelines',
         context='Une jeune marque de tissus wax voulait une image premium sans renier ses racines.',
         context_en='A young wax-fabric brand wanted a premium image without turning its back on its roots.',
         approach='Trente esquisses de monogramme, un motif dérivé des tissus, une palette de quatre couleurs et une grille pour toutes les déclinaisons.',
         approach_en='Thirty monogram sketches, a pattern derived from the fabrics, a four-colour palette and a grid for every application.',
         result='Une charte de 24 pages, des étiquettes, un packaging et des gabarits réseaux sociaux prêts à l’emploi.',
         result_en='24-page brand guidelines, labels, packaging and ready-to-use social media templates.',
         stack='Illustrator, Photoshop, Branding', accent='#FFB800'),
    dict(title='Kora Market', slug='kora-market', client='Projet démo', year=2026, pole='dev', order=3,
         category='E-commerce', category_en='E-commerce',
         summary='Boutique headless pour une marque de mode africaine. Transitions de pages fluides, panier instantané, back-office Django.',
         summary_en='Headless store for an African fashion brand. Smooth page transitions, instant cart, Django back office.',
         role='Développement full-stack', role_en='Full-stack development',
         context='Le site existant était lent et impossible à mettre à jour sans développeur.',
         context_en='The existing site was slow and impossible to update without a developer.',
         approach='Un front Angular découplé, une API Django REST, le paiement Stripe et un back-office pensé pour l’équipe marketing.',
         approach_en='A decoupled Angular front end, a Django REST API, Stripe payments and a back office designed for the marketing team.',
         result='Pages chargées en moins d’une seconde et catalogue géré en autonomie par la marque.',
         result_en='Pages load in under a second and the brand manages its catalogue on its own.',
         stack='Angular, Django REST, Stripe, PostgreSQL', accent='#FF5B2E'),
    dict(title='Festival Nuits Bleues', slug='nuits-bleues', client='Projet démo', year=2025, pole='design', order=4,
         category='Affiche & print', category_en='Poster & print',
         summary='Série d’affiches, programme imprimé et signalétique pour un festival de musique. Typographie expressive, grille modulaire.',
         summary_en='Poster series, printed programme and signage for a music festival. Expressive typography, modular grid.',
         role='Direction artistique, print', role_en='Art direction, print',
         context='Un festival de jazz qui voulait rajeunir son public sans perdre ses fidèles.',
         context_en='A jazz festival that wanted to attract a younger crowd without losing its regulars.',
         approach='Une typographie qui « joue » comme un instrument, une grille modulaire et une impression en deux tons pour tenir le budget.',
         approach_en='Typography that “plays” like an instrument, a modular grid and two-tone printing to stay within budget.',
         result='Six affiches, un programme de 32 pages et une signalétique déclinée sur trois scènes.',
         result_en='Six posters, a 32-page programme and signage across three stages.',
         stack='InDesign, Illustrator, Typographie', accent='#3D7BFF'),
    dict(title='Pulse Analytics', slug='pulse-analytics', client='Projet démo', year=2025, pole='dev', order=5,
         category='SaaS', category_en='SaaS',
         summary='Tableau de bord temps réel pour suivre des millions d’événements. WebSockets, graphiques interactifs, design system complet.',
         summary_en='Real-time dashboard to follow millions of events. WebSockets, interactive charts, a complete design system.',
         role='UI design, développement full-stack', role_en='UI design, full-stack development',
         context='Une startup data devait présenter ses métriques à des clients non techniques.',
         context_en='A data startup needed to show its metrics to non-technical clients.',
         approach='Un design system dessiné puis codé en composants Angular, et des données poussées en direct par Django Channels.',
         approach_en='A design system drawn then coded as Angular components, with data pushed live by Django Channels.',
         result='Un produit livré en dix semaines, et un design system réutilisé sur deux autres outils.',
         result_en='A product shipped in ten weeks, and a design system reused across two other tools.',
         stack='Angular Signals, Django Channels, Redis', accent='#7B61FF'),
    dict(title='Kemet Café', slug='kemet-cafe', client='Projet démo', year=2025, pole='design', order=6,
         category='Packaging', category_en='Packaging',
         summary='Packaging et étiquettes pour une gamme de cafés de spécialité. Illustrations sur mesure, impression en deux tons.',
         summary_en='Packaging and labels for a specialty coffee range. Custom illustrations, two-tone printing.',
         role='Illustration, packaging', role_en='Illustration, packaging',
         context='Une torréfaction artisanale voulait se distinguer en rayon.',
         context_en='A craft coffee roaster wanted to stand out on the shelf.',
         approach='Une illustration par origine, un système de couleurs par intensité et des étiquettes pensées pour l’impression artisanale.',
         approach_en='One illustration per origin, a colour system by roast intensity and labels designed for small-batch printing.',
         result='Une gamme de cinq cafés reconnaissable au premier regard.',
         result_en='A five-coffee range recognisable at first glance.',
         stack='Illustrator, Procreate, Packaging', accent='#C8553D'),
    dict(title='Archipel', slug='archipel', client='Projet démo', year=2025, pole='dev', order=7,
         category='Site éditorial', category_en='Editorial website',
         summary='Magazine numérique sur l’architecture insulaire. Typographie expressive, scroll narratif, CMS sur mesure.',
         summary_en='A digital magazine about island architecture. Expressive typography, narrative scrolling, custom CMS.',
         role='Design éditorial, développement', role_en='Editorial design, development',
         context='Une revue papier qui passait au numérique sans vouloir perdre son âme typographique.',
         context_en='A print magazine going digital without losing its typographic soul.',
         approach='Des gabarits éditoriaux dessinés comme des doubles pages, un scroll narratif GSAP et un CMS Wagtail.',
         approach_en='Editorial templates designed like spreads, GSAP narrative scrolling and a Wagtail CMS.',
         result='Un magazine lu en moyenne six minutes par article.',
         result_en='A magazine read for six minutes per article on average.',
         stack='Angular, GSAP, Django, Wagtail', accent='#2EE6D6'),
]

EXPERIENCES = [
    dict(role='Fondateur & directeur créatif', role_en='Founder & creative director', company='Aztiste Studio',
         location='Remote', kind='work', pole='both', start=date(2024, 1, 1), end=None, order=1,
         description='Deux pôles : design graphique (identité, print, UI) et développement logiciel (web, API, WebGL).',
         description_en='Two practices: graphic design (identity, print, UI) and software development (web, APIs, WebGL).'),
    dict(role='Développeur full-stack', role_en='Full-stack developer', company='Structure à renseigner',
         location='Ville', kind='work', pole='dev', start=date(2022, 9, 1), end=date(2023, 12, 31), order=2,
         description='Applications Angular / Django en production, API REST, CI/CD.',
         description_en='Angular / Django applications in production, REST APIs, CI/CD.'),
    dict(role='Graphiste freelance', role_en='Freelance graphic designer', company='Clients divers',
         location='Remote', kind='side', pole='design', start=date(2021, 3, 1), end=date(2023, 12, 31), order=3,
         description='Logos, affiches et supports print pour des associations, artistes et petites entreprises.',
         description_en='Logos, posters and print material for non-profits, artists and small businesses.'),
    dict(role='Formation en informatique', role_en='Computer science studies', company='École à renseigner',
         location='Ville', kind='education', pole='dev', start=date(2020, 9, 1), end=date(2022, 6, 30), order=4,
         description='Développement logiciel, bases de données, algorithmique.',
         description_en='Software development, databases, algorithms.'),
]

SKILLS = [
    ('Identité visuelle', 'Visual identity', 'design', 92), ('Illustrator', '', 'design', 90),
    ('Photoshop', '', 'design', 88), ('InDesign / Print', '', 'design', 82), ('Typographie', 'Typography', 'design', 85),
    ('Figma', '', 'design', 88),
    ('Angular', '', 'frontend', 95), ('TypeScript', '', 'frontend', 92), ('RxJS / Signals', '', 'frontend', 88),
    ('SCSS / CSS moderne', 'SCSS / modern CSS', 'frontend', 90),
    ('Django', '', 'backend', 92), ('Django REST Framework', '', 'backend', 90), ('PostgreSQL', '', 'backend', 82),
    ('Python', '', 'backend', 90),
    ('Three.js', '', 'creative', 85), ('GLSL', '', 'creative', 72), ('GSAP', '', 'creative', 90),
    ('Git', '', 'tooling', 90), ('Docker', '', 'tooling', 78), ('CI/CD', '', 'tooling', 75), ('Linux', '', 'tooling', 80),
]


def fill(model, lookup, values):
    """Crée l'objet, ou complète uniquement ses champs vides : on n'écrase jamais une saisie de l'admin."""
    obj, created = model.objects.get_or_create(**lookup, defaults=values)
    if not created:
        changed = [k for k, v in values.items() if v not in ('', None) and getattr(obj, k) in ('', None)]
        for k in changed:
            setattr(obj, k, values[k])
        if changed:
            obj.save(update_fields=changed)


class Command(BaseCommand):
    help = 'Ajoute le contenu de démonstration (complète sans écraser l’existant).'

    def handle(self, *args, **options):
        for p in PROJECTS:
            fill(Project, {'slug': p['slug']}, p)
        for e in EXPERIENCES:
            fill(Experience, {'role': e['role'], 'company': e['company']}, e)
        for i, (name, name_en, group, level) in enumerate(SKILLS):
            fill(Skill, {'name': name}, dict(name_en=name_en, group=group, level=level, order=i))
        if options['verbosity']:
            self.stdout.write(self.style.SUCCESS('Contenu de démonstration ajouté.'))
