"""Contenu du site tiré du CV de Kouadio Azania (modifiable ensuite depuis l'admin)."""

from datetime import date

from django.core.management.base import BaseCommand

from portfolio.models import Experience, Project, Skill

PROJECTS = [
    dict(title='BabiLoc', slug='babiloc', client='BabiLoc — Abidjan', year=2025, pole='dev', order=1,
         category='Application mobile', category_en='Mobile app',
         summary='Application de location de biens — véhicules et immobilier — dans la ville d’Abidjan. Publiée sur les stores.',
         summary_en='A rental app for vehicles and real estate in Abidjan. Published on the app stores.',
         role='Lead développeur — architecture, back-end Django, application Flutter',
         role_en='Lead developer — architecture, Django back end, Flutter app',
         context='À Abidjan, louer un véhicule ou un logement passe encore beaucoup par le bouche-à-oreille et les échanges informels. '
                 'BabiLoc réunit l’offre et la demande dans une seule application.',
         context_en='In Abidjan, renting a vehicle or a home still relies heavily on word of mouth and informal exchanges. '
                    'BabiLoc brings supply and demand together in a single app.',
         approach='J’ai conçu l’architecture complète : une API Django pour la logique métier et une application Flutter pour Android et iOS. '
                  'J’ai développé les modules critiques — réservations, authentification, notifications push et paiement — '
                  'et piloté le périmètre fonctionnel avec des livraisons itératives.',
         approach_en='I designed the full architecture: a Django API for the business logic and a Flutter app for Android and iOS. '
                     'I built the critical modules — bookings, authentication, push notifications and payment — '
                     'and drove the functional scope through iterative releases.',
         result='Application publiée sur les stores, avec une pipeline de déploiement continu pour livrer chaque évolution rapidement.',
         result_en='The app is live on the stores, with a continuous deployment pipeline to ship every change quickly.',
         stack='Flutter, Dart, Django, API REST, PostgreSQL, CI/CD', accent='#FF6E10'),
    dict(title='Smart Archive', slug='smart-archive', client='Projet personnel', year=2026, pole='dev', order=2,
         category='Plateforme web', category_en='Web platform',
         summary='Plateforme de gestion scolaire : comptes, établissements, inscriptions, dossiers et pédagogie, avec une API Django et un front Angular.',
         summary_en='A school management platform: accounts, institutions, enrolments, records and teaching, with a Django API and an Angular front end.',
         role='Développement full-stack', role_en='Full-stack development',
         context='Dans beaucoup d’établissements, inscriptions et dossiers d’élèves vivent encore sur papier ou dans des tableurs dispersés.',
         context_en='In many schools, enrolments and student records still live on paper or in scattered spreadsheets.',
         approach='Une API Django REST découpée en modules métier (comptes, établissements, inscriptions, dossiers, pédagogie) '
                  'et une application Angular qui la consomme.',
         approach_en='A Django REST API split into business modules (accounts, institutions, enrolments, records, teaching) '
                     'and an Angular app consuming it.',
         result='Une base complète pour numériser le suivi administratif et pédagogique d’un établissement.',
         result_en='A complete foundation to digitise a school’s administrative and teaching records.',
         stack='Django, API REST, Angular, TypeScript', accent='#7B61FF',
         repo_url='https://github.com/Azania-Eraste/Smart_Archive_Backend'),
    dict(title='SmartBin', slug='smartbin', client='Projet IoT', year=2026, pole='dev', order=3,
         category='IoT', category_en='IoT',
         summary='Supervision en temps réel du remplissage des poubelles urbaines : capteur ESP32, backend Flask, tableau de bord en direct.',
         summary_en='Real-time monitoring of urban bin fill levels: ESP32 sensor, Flask back end, live dashboard.',
         role='Conception IoT, back-end et tableau de bord', role_en='IoT design, back end and dashboard',
         context='Les camions de collecte passent souvent devant des poubelles vides, et trop tard devant celles qui débordent.',
         context_en='Collection trucks often stop at empty bins, and too late at overflowing ones.',
         approach='Un ESP32 équipé d’un capteur ultrasonique HC-SR04 mesure le niveau et l’envoie au backend Flask, '
                  'qui le diffuse en direct au tableau de bord web (Server-Sent Events, avec repli en polling).',
         approach_en='An ESP32 with an HC-SR04 ultrasonic sensor measures the level and sends it to a Flask back end, '
                     'which streams it live to the web dashboard (Server-Sent Events, with a polling fallback).',
         result='Un prototype fonctionnel avec alertes de débordement, pensé pour optimiser les tournées et collecter des données '
                'pour une future prédiction du remplissage.',
         result_en='A working prototype with overflow alerts, designed to optimise collection rounds and gather data '
                   'for future fill-level prediction.',
         stack='ESP32, Python, Flask, SSE, JavaScript', accent='#2EE6D6',
         repo_url='https://github.com/Azania-Eraste/Gestion-des-dechets'),
    dict(title='Marketplace Django', slug='ecommerce-vivrier', client='Projet académique — IIT', year=2025, pole='dev', order=4,
         category='E-commerce', category_en='E-commerce',
         summary='Marketplace de produits vivriers multi-vendeurs, avec livreurs et paiement en ligne, réalisée à l’issue du cours de programmation web avec Python.',
         summary_en='A multi-vendor marketplace for food produce, with couriers and online payment, built at the end of the Python web programming course.',
         role='Développement full-stack', role_en='Full-stack development',
         context='Projet de fin de cours de programmation web à l’Institut Ivoirien de Technologie : '
                 'livrer une boutique en ligne complète, du catalogue jusqu’à la livraison.',
         context_en='End-of-course project for web programming at the Institut Ivoirien de Technologie: '
                    'deliver a complete online store, from catalogue to delivery.',
         approach='Une application Django avec trois rôles — acheteur, vendeur et livreur — chacun avec son tableau de bord. '
                  'Panier, commandes confirmées par le vendeur, paiement Stripe et code de livraison pour valider la remise du colis. '
                  'Un vendeur ne peut pas acheter ses propres produits.',
         approach_en='A Django application with three roles — buyer, seller and courier — each with its own dashboard. '
                     'Cart, seller-confirmed orders, Stripe payment and a delivery code to confirm hand-over. '
                     'Sellers cannot buy their own products.',
         result='Une marketplace 100 % fonctionnelle, de la navigation dans le catalogue jusqu’à la livraison confirmée.',
         result_en='A fully working marketplace, from browsing the catalogue to a confirmed delivery.',
         stack='Python, Django, Stripe, JavaScript', accent='#3D7BFF',
         repo_url='https://github.com/Azania-Eraste/Projet_final_Django'),
    dict(title='Griot', slug='griot', client='Projet personnel', year=2025, pole='dev', order=5,
         category='Application mobile', category_en='Mobile app',
         summary='Application mobile qui fait découvrir les contes et légendes des régions de Côte d’Ivoire.',
         summary_en='A mobile app to discover the tales and legends of Côte d’Ivoire’s regions.',
         role='Développement mobile', role_en='Mobile development',
         context='Les contes et légendes ivoiriens se transmettent surtout à l’oral, et se perdent avec le temps.',
         context_en='Ivorian tales and legends are mostly passed on orally, and fade over time.',
         approach='Une application Flutter qui organise les récits par région, pour les lire facilement sur mobile.',
         approach_en='A Flutter app that organises the stories by region, to read them easily on a phone.',
         result='Une application multiplateforme (Android, iOS) au service du patrimoine culturel.',
         result_en='A cross-platform app (Android, iOS) serving cultural heritage.',
         stack='Flutter, Dart', accent='#FFB800',
         repo_url='https://github.com/Azania-Eraste/Griot'),
    dict(title='Gestion de parc informatique', slug='odoo-parc-informatique', client='Projet académique', year=2025, pole='dev', order=6,
         category='Module Odoo', category_en='Odoo module',
         summary='Module Odoo de gestion de parc informatique : inventaire des équipements, maintenance planifiée et portail.',
         summary_en='An Odoo module for IT asset management: equipment inventory, scheduled maintenance and a portal.',
         role='Développement Odoo', role_en='Odoo development',
         context='Suivre qui utilise quel équipement, et quand il doit être entretenu, devient vite ingérable dans un tableur.',
         context_en='Tracking who uses which device, and when it needs servicing, quickly becomes unmanageable in a spreadsheet.',
         approach='Un module Odoo sur mesure (it_asset_management) : modèles d’équipements, tâches de maintenance automatiques '
                  'planifiées par cron et un portail pour les utilisateurs.',
         approach_en='A custom Odoo module (it_asset_management): equipment models, automatic maintenance tasks '
                     'scheduled by cron and a user portal.',
         result='Un module installable qui centralise le parc informatique dans l’ERP.',
         result_en='An installable module that brings IT asset management into the ERP.',
         stack='Python, Odoo, XML', accent='#C8553D',
         repo_url='https://github.com/Azania-Eraste/Projet_final_addons'),
    dict(title='Affiches AEEECI', slug='affiches-aeeeci', client='AEEECI District Sion', year=2025, pole='design', order=7,
         category='Affiche & réseaux sociaux', category_en='Posters & social media',
         summary='Création des affiches des activités d’une association de jeunes, publiées sur sa page Facebook.',
         summary_en='Posters for a youth association’s events, published on its Facebook page.',
         role='Design graphique', role_en='Graphic design',
         context='L’association AEEECI District Sion rassemble des jeunes autour de nombreuses activités. '
                 'Chacune a besoin d’une affiche claire et attirante pour mobiliser sur les réseaux sociaux.',
         context_en='The AEEECI District Sion association brings young people together around many events. '
                    'Each one needs a clear, eye-catching poster to rally people on social media.',
         approach='Des affiches pensées pour être lues en un coup d’œil sur un fil d’actualité : hiérarchie nette entre '
                  'l’événement, la date et le lieu, couleurs de l’association et format adapté à Facebook.',
         approach_en='Posters designed to be read at a glance in a news feed: a clear hierarchy between the event, '
                     'the date and the venue, the association’s colours and a Facebook-friendly format.',
         result='Une série d’affiches publiées sur la page de l’association, avec une image cohérente d’un événement à l’autre.',
         result_en='A series of posters published on the association’s page, with a consistent look from one event to the next.',
         stack='Canva, Affinity', accent='#FFB800',
         live_url='https://web.facebook.com/profile.php?id=61579980350864'),
    dict(title='Octobre Rose', slug='octobre-rose-motion', client='Projet personnel', year=2026, pole='design', order=8,
         category='Motion design', category_en='Motion design',
         summary='Vidéo courte de sensibilisation au cancer du sein, réalisée en vibe motion design pour les réseaux sociaux.',
         summary_en='A short breast cancer awareness video, made with vibe motion design for social media.',
         role='Motion design', role_en='Motion design',
         context='« 1 femme sur 9 sera touchée par le cancer du sein au cours de sa vie. » Un chiffre fort, '
                 'qui doit être compris en quelques secondes dans un fil d’actualité.',
         context_en='“1 woman in 9 will develop breast cancer in her lifetime.” A powerful figure that has to land '
                    'in a few seconds in a news feed.',
         approach='Une animation au format vertical, construite en vibe motion design : le message est décrit, généré '
                  'puis affiné itération après itération, en gardant le chiffre clé au centre de l’écran.',
         approach_en='A vertical animation built with vibe motion design: the message is described, generated '
                     'and then refined iteration after iteration, keeping the key figure centre stage.',
         result='Un reel publié sur Facebook pour porter le message de prévention d’Octobre Rose.',
         result_en='A reel published on Facebook to carry the Pink October prevention message.',
         stack='Vibe motion design, Motion design', accent='#FF5B9A',
         live_url='https://web.facebook.com/reel/2533563517133511'),
]

# Projets fictifs du contenu de démo : masqués (pas supprimés, leur fiche reste dans l'admin)
DEMO_PROJECTS = ['nebula-os', 'maison-wax', 'kora-market', 'nuits-bleues', 'pulse-analytics', 'kemet-cafe', 'archipel']

EXPERIENCES = [
    dict(role='Stagiaire développeur full-stack web', role_en='Full-stack web developer intern', company='ATG',
         location='Bonoua, Yaou', kind='work', pole='dev', start=date(2026, 6, 1), end=None, order=1,
         description='Déploiement et intégration d’applications métier. Administration et sécurisation des systèmes d’information. '
                     'Support technique et assistance utilisateurs. Gestion des données et reporting.',
         description_en='Deploying and integrating business applications. Administering and securing information systems. '
                        'Technical support and user assistance. Data management and reporting.'),
    dict(role='Lead développeur', role_en='Lead developer', company='BabiLoc',
         location='Abidjan', kind='work', pole='dev', start=date(2025, 6, 1), end=None, order=2,
         description='Architecture et déploiement de BabiLoc (Flutter + Django) sur les stores. Modules critiques : réservations, '
                     'authentification, notifications push et paiement. Pipeline de déploiement continu, livraisons itératives.',
         description_en='Architected and shipped BabiLoc (Flutter + Django) to the app stores. Critical modules: bookings, '
                        'authentication, push notifications and payment. Continuous deployment pipeline, iterative releases.'),
    dict(role='Licence en génie logiciel', role_en='Bachelor’s degree in software engineering', company='Institut Ivoirien de Technologie',
         location='Grand-Bassam', kind='education', pole='dev', start=date(2023, 9, 1), end=date(2026, 6, 30), order=3,
         description='Computer Science, option génie logiciel.',
         description_en='Computer Science, software engineering track.'),
]

# Expériences fictives du contenu de démo : supprimées
DEMO_EXPERIENCES = [
    ('Développeur full-stack', 'Structure à renseigner'),
    ('Graphiste freelance', 'Clients divers'),
    ('Formation en informatique', 'École à renseigner'),
    ('Fondateur & directeur créatif', 'Aztiste Studio'),
]

# (nom, nom anglais, groupe, niveau 0-100) — niveaux à ajuster dans l'admin
SKILLS = [
    ('Python', '', 'backend', 90), ('Django', '', 'backend', 90), ('API REST', 'REST APIs', 'backend', 88),
    ('PostgreSQL', '', 'backend', 80), ('MySQL', '', 'backend', 78), ('Flask', '', 'backend', 70), ('Odoo', '', 'backend', 65),
    ('Flutter / Dart', '', 'frontend', 85), ('Angular', '', 'frontend', 72), ('TypeScript', '', 'frontend', 72),
    ('Git / GitHub', '', 'tooling', 88), ('CI/CD', '', 'tooling', 78), ('n8n', '', 'tooling', 75),
    ('Identité visuelle', 'Visual identity', 'design', 75), ('Figma', '', 'design', 75), ('Photoshop', '', 'design', 70),
    ('Canva', '', 'design', 85), ('Affinity', '', 'design', 75),
    ('Vibe motion design', '', 'creative', 72),
]

# Compétences du contenu de démo absentes du CV : supprimées
DEMO_SKILLS = [
    'Illustrator', 'InDesign / Print', 'Typographie', 'RxJS / Signals', 'SCSS / CSS moderne', 'Django REST Framework',
    'Three.js', 'GLSL', 'GSAP', 'Git', 'Docker', 'Linux',
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
    help = 'Charge le contenu du CV (complète sans écraser l’existant) et retire le contenu de démo.'

    def handle(self, *args, **options):
        Project.objects.filter(slug__in=DEMO_PROJECTS).update(featured=False)
        for role, company in DEMO_EXPERIENCES:
            Experience.objects.filter(role=role, company=company).delete()
        Skill.objects.filter(name__in=DEMO_SKILLS).delete()

        for p in PROJECTS:
            fill(Project, {'slug': p['slug']}, p)
        for e in EXPERIENCES:
            fill(Experience, {'role': e['role'], 'company': e['company']}, e)
        for i, (name, name_en, group, level) in enumerate(SKILLS):
            fill(Skill, {'name': name}, dict(name_en=name_en, group=group, level=level, order=i))
        if options['verbosity']:
            self.stdout.write(self.style.SUCCESS('Contenu du CV chargé.'))
