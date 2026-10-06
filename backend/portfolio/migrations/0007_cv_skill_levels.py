"""Aligne une seule fois les niveaux des compétences sur le CV.

Le seed ne remplace jamais une valeur existante : sans cette migration, les compétences
déjà en base garderaient les niveaux du contenu de démo. Les modifications faites
ensuite dans l'admin ne sont pas touchées (une migration ne s'exécute qu'une fois).
"""

from django.db import migrations

CV_SKILLS = {
    'Python': ('backend', 90), 'Django': ('backend', 90), 'PostgreSQL': ('backend', 80),
    'Angular': ('frontend', 72), 'TypeScript': ('frontend', 72), 'CI/CD': ('tooling', 78),
    'Identité visuelle': ('design', 75), 'Figma': ('design', 75), 'Photoshop': ('design', 70),
}


def apply(apps, schema_editor):
    Skill = apps.get_model('portfolio', 'Skill')
    for name, (group, level) in CV_SKILLS.items():
        Skill.objects.filter(name=name).update(group=group, level=level)


class Migration(migrations.Migration):
    dependencies = [('portfolio', '0006_alter_skill_group')]
    operations = [migrations.RunPython(apply, migrations.RunPython.noop)]
