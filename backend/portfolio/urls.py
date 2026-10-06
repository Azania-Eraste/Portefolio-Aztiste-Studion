from django.urls import path

from . import views

urlpatterns = [
    path('projects/', views.ProjectList.as_view()),
    path('projects/<slug:slug>/', views.ProjectDetail.as_view()),
    path('experiences/', views.ExperienceList.as_view()),
    path('skills/', views.SkillList.as_view()),
    path('contact/', views.ContactCreate.as_view()),
]
