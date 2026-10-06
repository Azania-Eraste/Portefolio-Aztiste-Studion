from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ContactMessage, Project


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
        self.assertEqual({p['pole'] for p in res.json()}, {'design', 'dev'})

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
        res = self.client.get('/api/projects/maison-wax/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data['context'])
        self.assertEqual(data['pole_label'], 'Design graphique')
        self.assertEqual(data['prev']['slug'], 'nebula-os')
        self.assertEqual(data['next']['slug'], 'kora-market')
        self.assertEqual(data['images'], [])

    def test_detail_en_falls_back_to_fr(self):
        Project.objects.filter(slug='maison-wax').update(result_en='')
        data = self.client.get('/api/projects/maison-wax/?lang=en').json()
        self.assertEqual(data['category'], 'Visual identity')
        self.assertEqual(data['pole_label'], 'Graphic design')
        self.assertIn('charte', data['result'])  # pas de version anglaise : français conservé

    def test_unknown_or_hidden_project_404(self):
        self.assertEqual(self.client.get('/api/projects/nope/').status_code, 404)
        Project.objects.filter(slug='archipel').update(featured=False)
        self.assertEqual(self.client.get('/api/projects/archipel/').status_code, 404)

    def test_seed_never_overwrites_admin_edits(self):
        Project.objects.filter(slug='kemet-cafe').update(summary='Texte saisi dans l’admin')
        call_command('seed', verbosity=0)
        self.assertEqual(Project.objects.get(slug='kemet-cafe').summary, 'Texte saisi dans l’admin')
