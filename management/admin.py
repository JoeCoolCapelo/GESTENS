from django.contrib import admin
from .models import (
    Faculte, AnneeAcademique, Salle, Departement, Enseignant, 
    Classe, Matiere, Semestre, Enseignement, EmploiDuTemps, Universite
)

@admin.register(Faculte)
class FaculteAdmin(admin.ModelAdmin):
    list_display = ('nom', 'email', 'logo')
    search_fields = ('nom', 'email')

@admin.register(AnneeAcademique)
class AnneeAcademiqueAdmin(admin.ModelAdmin):
    list_display = ('nom', 'is_current')
    list_filter = ('is_current',)

@admin.register(Salle)
class SalleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'capacite', 'faculte')
    list_filter = ('faculte',)

@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('nom', 'faculte')
    list_filter = ('faculte',)
    search_fields = ('nom',)

@admin.register(Enseignant)
class EnseignantAdmin(admin.ModelAdmin):
    list_display = ('prenom', 'nom', 'matricule', 'departement')
    search_fields = ('nom', 'prenom', 'matricule')
    list_filter = ('departement', 'type')

@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ('nom', 'niveau', 'departement')
    list_filter = ('departement', 'niveau')
    search_fields = ('nom',)

@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ('code', 'nom', 'departement')
    list_filter = ('departement',)
    search_fields = ('code', 'nom')

@admin.register(Semestre)
class SemestreAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type')
    list_filter = ('type',)

@admin.register(Enseignement)
class EnseignementAdmin(admin.ModelAdmin):
    list_display = ('enseignant', 'matiere', 'classe', 'semestre')
    list_filter = ('semestre', 'classe', 'enseignant')

@admin.register(EmploiDuTemps)
class EmploiDuTempsAdmin(admin.ModelAdmin):
    list_display = ('jour', 'heure_debut', 'heure_fin', 'enseignement')
    list_filter = ('jour',)

@admin.register(Universite)
class UniversiteAdmin(admin.ModelAdmin):
    list_display = ('nom', 'sigle', 'slogan')
