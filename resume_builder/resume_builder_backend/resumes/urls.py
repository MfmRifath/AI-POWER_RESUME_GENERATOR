from django.urls import path
from .views import GenerateResume

urlpatterns = [
    path('generate-resume/', GenerateResume.as_view(), name='generate_resume'),
]