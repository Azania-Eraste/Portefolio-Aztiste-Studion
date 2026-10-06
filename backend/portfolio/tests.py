from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ContactMessage, Experience, Project


class ApiTests(TestCase):
    def setUp(self):
        cache.clear()  # remet le compteur de throttling à zéro
        call_command('seed', verbosity=0)
        self.client = APIClient()

    def test_projects_list(self):
        res = self.client.get('/api/projects/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), Project.objects.filter(featured=True).count())
        self.assertIsInstance(res.json()[0]['stack'], list)
        self.assertEqual({p['pole'] for p in res.json()}, {'dev'})

    def test_skills_and_experiences(self):
        self.assertEqual(self.client.get('/api/skills/').status_code, 200)
        self.assertEqual(self.client.get('/api/experiences/').status_code, 200)

    def test_contact_valid(self):
        res = self.client.post('/api/contact/', {
            'name': 'Ada', 'email': 'ada@example.com', 'service': 'both',
            'message': 'Bonjour, un logo et un site ?',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(ContactMessage.objects.get().service, 'both')

    def test_contact_invalid(self):
        res = self.client.post('/api/contact/', {'name': '', 'email': 'nope', 'message': 'x'}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('email', res.json())

    def test_contact_honeypot_not_saved(self):
        res = self.client.post('/api/contact/', {
            'name': 'Bot', 'email': 'bot@example.com', 'message': 'Spam spam spam spam',
            'website': 'http://spam.example',
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 0)


class CaseStudyTests(TestCase):
    def setUp(self):
        cache.clear()
        call_command('seed', verbosity=0)
        self.client = APIClient()

    def test_detail_fr_with_neighbours(self):
        res = self.client.get('/api/projects/babiloc/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data['context'])
        self.assertEqual(data['pole_label'], 'Développement logiciel')
        # Premier projet : le précédent boucle sur le dernier
        self.assertEqual(data['prev']['slug'], 'odoo-parc-informatique')
        self.assertEqual(data['next']['slug'], 'smart-archive')
        self.assertEqual(data['images'], [])

    def test_detail_en_falls_back_to_fr(self):
        Project.objects.filter(slug='babiloc').update(result_en='')
        data = self.client.get('/api/projects/babiloc/?lang=en').json()
        self.assertEqual(data['category'], 'Mobile app')
        self.assertEqual(data['pole_label'], 'Software development')
        self.assertIn('stores', data['result'])  # pas de version anglaise : français conservé

    def test_unknown_or_hidden_project_404(self):
        self.assertEqual(self.client.get('/api/projects/nope/').status_code, 404)
        Project.objects.filter(slug='ecommerce-vivrier').update(featured=False)
        self.assertEqual(self.client.get('/api/projects/ecommerce-vivrier/').status_code, 404)

    def test_seed_never_overwrites_admin_edits(self):
        Project.objects.filter(slug='babiloc').update(summary='Texte saisi dans l’admin')
        call_command('seed', verbosity=0)
        self.assertEqual(Project.objects.get(slug='babiloc').summary, 'Texte saisi dans l’admin')

    def test_seed_hides_demo_content(self):
        Project.objects.create(slug='maison-wax', title='Maison Wax', year=2026, category='x', summary='x')
        Experience.objects.create(role='Graphiste freelance', company='Clients divers', start='2021-03-01')
        call_command('seed', verbosity=0)
        self.assertFalse(Project.objects.get(slug='maison-wax').featured)
        self.assertFalse(Experience.objects.filter(company='Clients divers').exists())
        from .management.commands.seed import PROJECTS
        self.assertEqual({p['slug'] for p in self.client.get('/api/projects/').json()}, {p['slug'] for p in PROJECTS})
