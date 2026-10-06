"""Outils réels des affiches AEEECI (Canva, Affinity).

Le seed ne remplace jamais une valeur existante : cette migration corrige une seule fois
la valeur provisoire, sans toucher à une saisie faite entre-temps dans l'admin.
"""

from django.db import migrations


def apply(apps, schema_editor):
    Project = apps.get_model('portfolio', 'Project')
    Project.objects.filter(slug='affiches-aeeeci', stack='Affiche, Typographie, Réseaux sociaux').update(
        stack='Canva, Affinity'
    )


class Migration(migrations.Migration):
    dependencies = [('portfolio', '0007_cv_skill_levels')]
    operations = [migrations.RunPython(apply, migrations.RunPython.noop)]
