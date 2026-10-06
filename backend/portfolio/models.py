from django.db import models


class Pole(models.TextChoices):
    DESIGN = 'design', 'Design graphique'
    DEV = 'dev', 'Développement logiciel'


class Project(models.Model):
    title = models.CharField('titre', max_length=120)
    slug = models.SlugField(unique=True)
    client = models.CharField(max_length=120, blank=True)
    year = models.PositiveSmallIntegerField('année')
    pole = models.CharField('pôle', max_length=10, choices=Pole.choices, default=Pole.DEV)
    category = models.CharField(
        'catégorie', max_length=60, help_text='Ex. Identité visuelle, Print, WebGL, SaaS'
    )
    category_en = models.CharField('catégorie (EN)', max_length=60, blank=True)
    summary = models.TextField('résumé', max_length=400)
    summary_en = models.TextField('résumé (EN)', max_length=400, blank=True)
    # Étude de cas
    role = models.CharField('rôle', max_length=160, blank=True, help_text='Ex. Identité visuelle, développement front')
    role_en = models.CharField('rôle (EN)', max_length=160, blank=True)
    context = models.TextField('contexte', blank=True, help_text='Le brief, le client, le problème')
    context_en = models.TextField('contexte (EN)', blank=True)
    approach = models.TextField('démarche', blank=True, help_text='Esquisses, choix graphiques, choix techniques')
    approach_en = models.TextField('démarche (EN)', blank=True)
    result = models.TextField('résultat', blank=True, help_text='Ce qui a été livré, les chiffres')
    result_en = models.TextField('résultat (EN)', blank=True)
    stack = models.CharField(
        max_length=200, blank=True, help_text='Technologies séparées par des virgules'
    )
    cover = models.ImageField('visuel', upload_to='projects/', blank=True)
    accent = models.CharField(
        'couleur', max_length=7, default='#FF6E10', help_text='Hex, utilisé quand il n’y a pas de visuel'
    )
    live_url = models.URLField('lien du site', blank=True)
    repo_url = models.URLField('lien du code', blank=True)
    featured = models.BooleanField('mis en avant', default=True)
    order = models.PositiveSmallIntegerField('ordre', default=0)

    class Meta:
        ordering = ['order', '-year']
        verbose_name = 'projet'

    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='projects/gallery/')
    caption = models.CharField('légende', max_length=200, blank=True)
    caption_en = models.CharField('légende (EN)', max_length=200, blank=True)
    wide = models.BooleanField('pleine largeur', default=False)
    order = models.PositiveSmallIntegerField('ordre', default=0)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'image'

    def __str__(self):
        return self.caption or self.image.name


class Experience(models.Model):
    class Kind(models.TextChoices):
        WORK = 'work', 'Expérience'
        EDUCATION = 'education', 'Formation'
        SIDE = 'side', 'Freelance / projet'

    role = models.CharField('poste', max_length=120)
    role_en = models.CharField('poste (EN)', max_length=120, blank=True)
    kind = models.CharField(
        'type', max_length=10, choices=Kind.choices, default=Kind.WORK,
        help_text='Formation et freelance apparaissent hachurés sur la timeline',
    )
    pole = models.CharField(
        'pôle', max_length=10, default='dev',
        choices=[('design', 'Design graphique'), ('dev', 'Développement'), ('both', 'Les deux')],
    )
    company = models.CharField('structure', max_length=120)
    location = models.CharField('lieu', max_length=80, blank=True)
    start = models.DateField('début')
    end = models.DateField('fin', null=True, blank=True, help_text='Vide = en cours')
    description = models.TextField(blank=True)
    description_en = models.TextField('description (EN)', blank=True)
    order = models.PositiveSmallIntegerField('ordre', default=0)

    class Meta:
        ordering = ['order', '-start']
        verbose_name = 'expérience'

    def __str__(self):
        return f'{self.role} — {self.company}'


class Skill(models.Model):
    class Group(models.TextChoices):
        DESIGN = 'design', 'Design graphique'
        FRONTEND = 'frontend', 'Front-end & mobile'
        BACKEND = 'backend', 'Back-end'
        CREATIVE = 'creative', 'Creative / Motion'
        TOOLING = 'tooling', 'DevOps & outils'

    name = models.CharField('nom', max_length=60)
    name_en = models.CharField('nom (EN)', max_length=60, blank=True)
    group = models.CharField('groupe', max_length=20, choices=Group.choices)
    level = models.PositiveSmallIntegerField('niveau (0-100)', default=80)
    order = models.PositiveSmallIntegerField('ordre', default=0)

    class Meta:
        ordering = ['group', 'order', 'name']
        verbose_name = 'compétence'

    def __str__(self):
        return self.name


class ContactMessage(models.Model):
    name = models.CharField('nom', max_length=120)
    email = models.EmailField()
    company = models.CharField('structure', max_length=120, blank=True)
    service = models.CharField(
        'besoin', max_length=10, blank=True,
        choices=[('design', 'Design graphique'), ('dev', 'Développement'), ('both', 'Les deux')],
    )
    budget = models.CharField(max_length=40, blank=True)
    message = models.TextField(max_length=4000)
    created_at = models.DateTimeField('reçu le', auto_now_add=True)
    read = models.BooleanField('lu', default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'message'

    def __str__(self):
        return f'{self.name} <{self.email}>'
