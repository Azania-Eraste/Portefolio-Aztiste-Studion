from django.contrib import admin

from .models import ContactMessage, Experience, Project, ProjectImage, Skill


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1
    fields = ['image', 'caption', 'caption_en', 'wide', 'order']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines = [ProjectImageInline]
    fieldsets = [
        (None, {'fields': ['title', 'slug', 'client', 'year', 'pole', 'category', 'summary', 'stack',
                           'cover', 'accent', 'live_url', 'repo_url', 'featured', 'order']}),
        ('Étude de cas', {'fields': ['role', 'context', 'approach', 'result']}),
        ('English', {'classes': ['collapse'], 'fields': ['category_en', 'summary_en', 'role_en',
                                                       'context_en', 'approach_en', 'result_en']}),
    ]
    list_display = ['title', 'pole', 'category', 'year', 'featured', 'order']
    list_editable = ['featured', 'order']
    list_filter = ['pole', 'category', 'featured', 'year']
    prepopulated_fields = {'slug': ['title']}
    search_fields = ['title', 'client', 'stack']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['role', 'company', 'kind', 'pole', 'start', 'end', 'order']
    list_editable = ['order']
    list_filter = ['kind', 'pole']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'group', 'level', 'order']
    list_editable = ['level', 'order']
    list_filter = ['group']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'service', 'budget', 'created_at', 'read']
    list_editable = ['read']
    list_filter = ['read', 'service', 'budget']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['name', 'email', 'company', 'service', 'budget', 'message', 'created_at']
