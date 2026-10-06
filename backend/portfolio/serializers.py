from rest_framework import serializers

from .models import ContactMessage, Experience, Project, Skill

# Libellés des choix (pôle, type, groupe) en anglais
EN_LABELS = {
    'Design graphique': 'Graphic design',
    'Développement logiciel': 'Software development',
    'Développement': 'Development',
    'Les deux': 'Both',
    'Expérience': 'Experience',
    'Formation': 'Education',
    'Freelance / projet': 'Freelance / project',
    'Outils / DevOps': 'Tools / DevOps',
}


class Translated:
    """Avec ?lang=en : chaque champ de `translated` prend sa version `_en` si elle est remplie."""

    translated: tuple[str, ...] = ()

    def to_representation(self, obj):
        data = super().to_representation(obj)
        if self.context.get('lang') != 'en':
            return data
        for f in self.translated:
            if getattr(obj, f + '_en', ''):
                data[f] = getattr(obj, f + '_en')
        for k, v in data.items():
            if k.endswith('_label'):
                data[k] = EN_LABELS.get(v, v)
        return data


def split_stack(obj):
    return [s.strip() for s in obj.stack.split(',') if s.strip()]


class ProjectSerializer(Translated, serializers.ModelSerializer):
    translated = ('category', 'summary')
    stack = serializers.SerializerMethodField()
    pole_label = serializers.CharField(source='get_pole_display', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'client', 'year', 'pole', 'pole_label', 'category', 'summary',
            'stack', 'cover', 'accent', 'live_url', 'repo_url',
        ]

    def get_stack(self, obj):
        return split_stack(obj)


class ProjectDetailSerializer(ProjectSerializer):
    translated = ('category', 'summary', 'role', 'context', 'approach', 'result')
    images = serializers.SerializerMethodField()
    prev = serializers.SerializerMethodField()
    next = serializers.SerializerMethodField()

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + [
            'role', 'context', 'approach', 'result', 'images', 'prev', 'next',
        ]

    def get_images(self, obj):
        request = self.context.get('request')
        en = self.context.get('lang') == 'en'
        return [
            {
                'url': request.build_absolute_uri(img.image.url) if request else img.image.url,
                'caption': (en and img.caption_en) or img.caption,
                'wide': img.wide,
            }
            for img in obj.images.all()
        ]

    def _neighbour(self, obj, step):
        # ponytail: liste chargée en mémoire, suffisant pour quelques dizaines de projets
        slugs = list(Project.objects.filter(featured=True).values_list('slug', 'title'))
        i = next((k for k, (s, _) in enumerate(slugs) if s == obj.slug), None)
        if i is None or not slugs:
            return None
        slug, title = slugs[(i + step) % len(slugs)]
        return {'slug': slug, 'title': title}

    def get_prev(self, obj):
        return self._neighbour(obj, -1)

    def get_next(self, obj):
        return self._neighbour(obj, 1)


class ExperienceSerializer(Translated, serializers.ModelSerializer):
    translated = ('role', 'description')
    kind_label = serializers.CharField(source='get_kind_display', read_only=True)

    class Meta:
        model = Experience
        fields = [
            'id', 'role', 'kind', 'kind_label', 'pole', 'company', 'location', 'start', 'end',
            'description',
        ]


class SkillSerializer(Translated, serializers.ModelSerializer):
    translated = ('name',)
    group_label = serializers.CharField(source='get_group_display', read_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'name', 'group', 'group_label', 'level']


class ContactSerializer(serializers.ModelSerializer):
    # Champ piège anti-spam : invisible pour un humain, rempli par les bots.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'company', 'service', 'budget', 'message', 'website']

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Dites-m’en un peu plus (10 caractères minimum).')
        return value

    def create(self, validated_data):
        validated_data.pop('website', None)
        return super().create(validated_data)
