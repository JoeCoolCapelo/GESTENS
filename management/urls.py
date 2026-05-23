from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, CustomLoginView, public_faculty_list, public_university_info, public_universities_list,
    FaculteViewSet, AnneeAcademiqueViewSet, SalleViewSet,
    DepartementViewSet, EnseignantViewSet,
    ClasseViewSet, MatiereViewSet, SemestreViewSet,
    EnseignementViewSet, EmploiDuTempsViewSet, UserViewSet, RecentActivityViewSet, UniversiteViewSet,
    profile_view, dashboard_stats, export_teachers_pdf, export_schedule_pdf
)

router = DefaultRouter()
router.register(r'facultes', FaculteViewSet, basename='faculte')
router.register(r'annees-academiques', AnneeAcademiqueViewSet)
router.register(r'salles', SalleViewSet, basename='salle')
router.register(r'departements', DepartementViewSet, basename='departement')
router.register(r'enseignants', EnseignantViewSet, basename='enseignant')
router.register(r'classes', ClasseViewSet, basename='classe')
router.register(r'matieres', MatiereViewSet, basename='matiere')
router.register(r'semestres', SemestreViewSet)
router.register(r'enseignements', EnseignementViewSet, basename='enseignement')
router.register(r'emplois-du-temps', EmploiDuTempsViewSet, basename='emploidutemps')
router.register(r'users', UserViewSet, basename='user')
router.register(r'activities', RecentActivityViewSet, basename='activity')
router.register(r'universities', UniversiteViewSet, basename='universite')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='custom_login'),
    path('profile/', profile_view, name='profile'),
    path('faculties-public/', public_faculty_list, name='faculties_public'),
    path('universities-public/', public_universities_list, name='universities_public'),
    path('university-info/', public_university_info, name='university_info'),
    path('university-info/<int:pk>/', public_university_info, name='university_info_pk'),
    path('stats/', dashboard_stats, name='dashboard_stats'),
    path('export/teachers/', export_teachers_pdf, name='export_teachers_pdf'),
    path('export/schedule/', export_schedule_pdf, name='export_schedule_pdf'),
]
