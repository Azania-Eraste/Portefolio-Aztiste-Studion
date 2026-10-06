from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = 'Aztiste Studio — Admin'
admin.site.site_title = 'Aztiste Studio'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('portfolio.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
