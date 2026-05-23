from django.db import models
from django.contrib.auth.models import User

class Universite(models.Model):
    nom = models.CharField(max_length=200, default="Université Gamal Abdel Nasser de Conakry")
    sigle = models.CharField(max_length=20, default="UGANC")
    slogan = models.CharField(max_length=200, default="Le temple du savoir")
    logo = models.ImageField(upload_to='university/logos/', null=True, blank=True)
    republique = models.CharField(max_length=100, default="RÉPUBLIQUE DE GUINÉE")
    email_contact = models.EmailField(max_length=100, default="info@uganc.edu.gn")
    bp = models.CharField(max_length=50, default="BP: 1147 Conakry")

    class Meta:
        verbose_name = "Université"
        verbose_name_plural = "Université"

    def __str__(self):
        return self.nom

class Faculte(models.Model):
    nom = models.CharField(max_length=150)
    logo = models.ImageField(upload_to='faculties/logos/', null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True)
    universite = models.ForeignKey(Universite, on_delete=models.CASCADE, related_name='facultes', null=True, blank=True)

    def __str__(self):
        return self.nom

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    faculte = models.ForeignKey(Faculte, on_delete=models.CASCADE, related_name='users')
    photo = models.ImageField(upload_to='profiles/photos/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.faculte.nom}"

class AnneeAcademique(models.Model):
    nom = models.CharField(max_length=20, unique=True, help_text="Ex: 2023-2024")
    description = models.TextField(null=True, blank=True)
    is_current = models.BooleanField(default=True)

    def __str__(self):
        return self.nom

class Salle(models.Model):
    nom = models.CharField(max_length=100)
    capacite = models.PositiveIntegerField(null=True, blank=True)
    faculte = models.ForeignKey(Faculte, on_delete=models.CASCADE, related_name='salles')

    def __str__(self):
        return f"{self.nom} ({self.faculte.nom})"

class Departement(models.Model):
    nom = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    faculte = models.ForeignKey(Faculte, on_delete=models.CASCADE, related_name='departements')

    def __str__(self):
        return self.nom

class Enseignant(models.Model):
    TYPES = [
        ('National', 'National'),
        ('Etranger', 'Étranger'),
    ]
    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)
    date_naissance = models.DateField(null=True, blank=True)
    telephone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True)
    specialite = models.CharField(max_length=150, null=True, blank=True)
    dernier_diplome = models.CharField(max_length=100, null=True, blank=True)
    grade_academique = models.CharField(max_length=100, null=True, blank=True)
    matricule = models.CharField(max_length=50, unique=True)
    fonction = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPES)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='enseignants')
    photo = models.ImageField(upload_to='teachers/photos/', null=True, blank=True)

    def __str__(self):
        return f"{self.prenom} {self.nom}"

class Classe(models.Model):
    nom = models.CharField(max_length=100)
    niveau = models.CharField(max_length=50) # Ex: L1, L2, M1...
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='classes')

    def __str__(self):
        return f"{self.nom} ({self.niveau})"

class Matiere(models.Model):
    nom = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='matieres')

    def __str__(self):
        return f"{self.code} - {self.nom}"

class Semestre(models.Model):
    TYPES = [
        ('Impair', 'Impair'),
        ('Pair', 'Pair'),
    ]
    nom = models.CharField(max_length=5, unique=True) # S1 à S8
    type = models.CharField(max_length=10, choices=TYPES)

    def __str__(self):
        return self.nom

class Enseignement(models.Model):
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE, related_name='enseignements')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='enseignements')
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='enseignements')
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE, related_name='enseignements')
    annee_academique = models.ForeignKey(AnneeAcademique, on_delete=models.CASCADE, related_name='enseignements', null=True, blank=True)

    def __str__(self):
        return f"{self.enseignant} - {self.matiere} ({self.classe}) - {self.annee_academique}"

class EmploiDuTemps(models.Model):
    JOURS = [
        ('Lundi', 'Lundi'),
        ('Mardi', 'Mardi'),
        ('Mercredi', 'Mercredi'),
        ('Jeudi', 'Jeudi'),
        ('Vendredi', 'Vendredi'),
        ('Samedi', 'Samedi'),
        ('Dimanche', 'Dimanche'),
    ]
    jour = models.CharField(max_length=15, choices=JOURS)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    enseignement = models.ForeignKey(Enseignement, on_delete=models.CASCADE, related_name='horaires')
    salle = models.ForeignKey(Salle, on_delete=models.SET_NULL, null=True, blank=True, related_name='horaires')

    def __str__(self):
        return f"{self.jour} : {self.heure_debut} - {self.heure_fin} (Salle: {self.salle})"

class RecentActivity(models.Model):
    ACTIONS = [
        ('create', 'Création'),
        ('update', 'Modification'),
        ('delete', 'Suppression'),
        ('info', 'Information'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    description = models.CharField(max_length=255)
    target_name = models.CharField(max_length=150, null=True, blank=True)
    action_type = models.CharField(max_length=20, choices=ACTIONS, default='info')
    timestamp = models.DateTimeField(auto_now_add=True)
    faculte = models.ForeignKey(Faculte, on_delete=models.SET_NULL, null=True, blank=True)
    is_archived = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Activité Récente"
        verbose_name_plural = "Activités Récentes"

    def __str__(self):
        return f"{self.user.username} - {self.description} ({self.timestamp})"
