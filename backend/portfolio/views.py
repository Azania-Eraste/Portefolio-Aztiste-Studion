from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import Experience, Project, Skill
from .serializers import (
    ContactSerializer,
    ExperienceSerializer,
    ProjectDetailSerializer,
    ProjectSerializer,
    SkillSerializer,
)


class LangMixin:
    """Transmet ?lang=en aux serializers."""

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'lang': self.request.query_params.get('lang', 'fr')}


class ProjectList(LangMixin, generics.ListAPIView):
    queryset = Project.objects.filter(featured=True)
    serializer_class = ProjectSerializer
    pagination_class = None


class ProjectDetail(LangMixin, generics.RetrieveAPIView):
    queryset = Project.objects.filter(featured=True).prefetch_related('images')
    serializer_class = ProjectDetailSerializer
    lookup_field = 'slug'


class ExperienceList(LangMixin, generics.ListAPIView):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    pagination_class = None


class SkillList(LangMixin, generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    pagination_class = None


class ContactCreate(generics.CreateAPIView):
    serializer_class = ContactSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact'
    # API JSON publique sans session : pas d'authentification, donc pas de CSRF.
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Bot détecté : on répond comme si tout allait bien, sans rien enregistrer.
        if serializer.validated_data.get('website'):
            return Response({'ok': True}, status=status.HTTP_201_CREATED)

        msg = serializer.save()
        if settings.CONTACT_NOTIFY_EMAIL:
            send_mail(
                subject=f'[Aztiste Studio] Nouveau message de {msg.name}',
                message=(
                    f'{msg.name} <{msg.email}>\n{msg.company}\n'
                    f'Besoin : {msg.get_service_display()} — Budget : {msg.budget}\n\n{msg.message}'
                ),
                from_email=None,
                recipient_list=[settings.CONTACT_NOTIFY_EMAIL],
                fail_silently=True,
            )
        return Response({'ok': True}, status=status.HTTP_201_CREATED)
