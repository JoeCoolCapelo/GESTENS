import os
import django
from datetime import date, time
import random
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestens_backend.settings')
django.setup()

from django.contrib.auth.models import User
from management.models import (
    Universite, Faculte, Departement, Enseignant, Classe, Matiere,
    Semestre, AnneeAcademique, Salle, Enseignement, EmploiDuTemps,
    UserProfile
)

def run():
    print("📌 Vérification de UGANC...")
    uganc, created = Universite.objects.get_or_create(
        sigle="UGANC",
        defaults={
            "nom": "Université Gamal Abdel Nasser de Conakry",
            "slogan": "Le temple du savoir",
            "republique": "RÉPUBLIQUE DE GUINÉE",
            "email_contact": "info@uganc.edu.gn",
            "bp": "BP: 1147 Conakry",
        }
    )

    print("📌 Création des Facultés pour UGANC...")
    facs_data = [
        {"nom": "Faculté des Sciences et Techniques (FST)", "email": "fst@uganc.edu.gn"},
        {"nom": "Faculté de Médecine (FMG)", "email": "fmg@uganc.edu.gn"},
        {"nom": "Faculté des Lettres (FLSH)", "email": "flsh@uganc.edu.gn"}
    ]
    
    faculties = []
    for f in facs_data:
        fac, _ = Faculte.objects.get_or_create(nom=f["nom"], universite=uganc, defaults={"email": f["email"]})
        faculties.append(fac)

    print("📌 Création des Départements...")
    depts_data = {
        "Faculté des Sciences et Techniques (FST)": ["Département de Mathématiques", "Département de Physique", "Département de Chimie"],
        "Faculté de Médecine (FMG)": ["Département de Pharmacie", "Département d'Odontologie"],
        "Faculté des Lettres (FLSH)": ["Département de Sociologie", "Département d'Histoire"]
    }

    departements = []
    for fac in faculties:
        for d_name in depts_data.get(fac.nom, []):
            dept, _ = Departement.objects.get_or_create(nom=d_name, faculte=fac)
            departements.append(dept)

    print("📌 Création de Salles, Classes, Enseignants et Matières...")
    annee_courante = AnneeAcademique.objects.filter(is_current=True).first()
    if not annee_courante:
        annee_courante = AnneeAcademique.objects.create(nom="2025-2026", is_current=True)
        
    semestre1, _ = Semestre.objects.get_or_create(nom="Semestre 1", type="IMPAIR")
    semestre2, _ = Semestre.objects.get_or_create(nom="Semestre 2", type="PAIR")
    semestre3, _ = Semestre.objects.get_or_create(nom="Semestre 3", type="IMPAIR")

    for fac in faculties:
        Salle.objects.get_or_create(nom=f"Amphi {fac.nom[:3]}", capacite=200, faculte=fac)
        Salle.objects.get_or_create(nom=f"Salle 101 {fac.nom[:3]}", capacite=50, faculte=fac)

    for dept in departements:
        Classe.objects.get_or_create(nom=f"Licence 1 {dept.nom.replace('Département de ', '')}", niveau="L1", departement=dept)
        Classe.objects.get_or_create(nom=f"Licence 2 {dept.nom.replace('Département de ', '')}", niveau="L2", departement=dept)
        
        Enseignant.objects.get_or_create(matricule=f"UGANC-MD-{dept.id}", defaults={"nom":"Diallo", "prenom":f"Mamadou {dept.id}", "email":f"mdiallo{dept.id}{random.randint(1000,9999)}@uganc.edu.gn", "telephone":f"+22462000{dept.id}1", "departement":dept})
        Enseignant.objects.get_or_create(matricule=f"UGANC-AB-{dept.id}", defaults={"nom":"Bah", "prenom":f"Aissatou {dept.id}", "email":f"abah{dept.id}{random.randint(1000,9999)}@uganc.edu.gn", "telephone":f"+22462000{dept.id}2", "departement":dept})

        Matiere.objects.get_or_create(nom=f"Introduction à {dept.nom.replace('Département de ', '')}", code=f"INTRO{dept.id}", departement=dept)
        Matiere.objects.get_or_create(nom=f"Avancé {dept.nom.replace('Département de ', '')}", code=f"ADV{dept.id}", departement=dept)

    print("📌 Création des comptes gestionnaires...")
    # On crée 3 comptes (1 par faculté)
    for fac in faculties:
        if "FST" in fac.nom:
            username = "resp_uganc_fst"
        elif "FMG" in fac.nom:
            username = "resp_uganc_fmg"
        else:
            username = "resp_uganc_flsh"
            
        user, created = User.objects.get_or_create(username=username, defaults={"email": fac.email})
        if created:
            user.set_password("passer123")
            user.save()
            UserProfile.objects.create(user=user, faculte=fac)
            print(f"   👤 Créé: {username} (passer123) pour {fac.nom}")
        else:
            profile, p_created = UserProfile.objects.get_or_create(user=user)
            if p_created or profile.faculte != fac:
                profile.faculte = fac
                profile.save()
            user.set_password("passer123")
            user.save()
            print(f"   👤 Mis à jour: {username} (passer123) pour {fac.nom}")

    print("✅ Données UGANC insérées avec succès !")

if __name__ == '__main__':
    run()
