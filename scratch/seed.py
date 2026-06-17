import os
import django
import sys
from datetime import time

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestens_backend.settings')
django.setup()

from management.models import Faculte, Departement, Classe, Matiere, Enseignant, Salle, Semestre, AnneeAcademique, Enseignement, EmploiDuTemps

def seed_data():
    print("Démarrage du peuplement de la base de données...")
    
    # 1. Vérifier l'année académique
    annee, created = AnneeAcademique.objects.get_or_create(nom="2026-2027", defaults={'is_current': True})
    if created:
        print("Année académique créée.")
    
    # 2. Créer les semestres si inexistants
    semestres_data = [('S1', 'Impair'), ('S2', 'Pair')]
    semestres_objs = []
    for nom, type_s in semestres_data:
        s, _ = Semestre.objects.get_or_create(nom=nom, defaults={'type': type_s})
        semestres_objs.append(s)
    
    # 3. Récupérer toutes les facultés
    facultes = Faculte.objects.all()
    if not facultes.exists():
        print("Aucune faculté trouvée. Créez d'abord des facultés.")
        return
        
    for faculte in facultes:
        print(f"\nGénération des données pour la faculté : {faculte.nom}")
        
        # Salles
        salle1, _ = Salle.objects.get_or_create(nom=f"Amphi A - {faculte.nom[:3].upper()}", faculte=faculte, defaults={'capacite': 100})
        salle2, _ = Salle.objects.get_or_create(nom=f"Salle 101 - {faculte.nom[:3].upper()}", faculte=faculte, defaults={'capacite': 50})
        salle3, _ = Salle.objects.get_or_create(nom=f"Labo Info - {faculte.nom[:3].upper()}", faculte=faculte, defaults={'capacite': 30})
        
        # Départements
        dept1, _ = Departement.objects.get_or_create(nom="Département Informatique", faculte=faculte)
        dept2, _ = Departement.objects.get_or_create(nom="Département Mathématiques", faculte=faculte)
        
        # Classes
        classe_l1_info, _ = Classe.objects.get_or_create(nom="Licence 1 Informatique", niveau="L1", departement=dept1)
        classe_l2_info, _ = Classe.objects.get_or_create(nom="Licence 2 Informatique", niveau="L2", departement=dept1)
        classe_l1_math, _ = Classe.objects.get_or_create(nom="Licence 1 Mathématiques", niveau="L1", departement=dept2)
        
        # Matières
        mat_algo, _ = Matiere.objects.get_or_create(nom="Algorithmique", code=f"ALG-{faculte.id}", departement=dept1)
        mat_web, _ = Matiere.objects.get_or_create(nom="Développement Web", code=f"WEB-{faculte.id}", departement=dept1)
        mat_alg, _ = Matiere.objects.get_or_create(nom="Algèbre Linéaire", code=f"ALGL-{faculte.id}", departement=dept2)
        
        # Enseignants
        ens1, _ = Enseignant.objects.get_or_create(
            matricule=f"ENS-{faculte.id}-001",
            defaults={
                'prenom': 'Jean', 'nom': 'Dupont', 'email': f'j.dupont{faculte.id}@univ.edu',
                'telephone': '622000001', 'specialite': 'Génie Logiciel',
                'grade_academique': 'Maître de Conférences', 'type': 'National',
                'departement': dept1
            }
        )
        ens2, _ = Enseignant.objects.get_or_create(
            matricule=f"ENS-{faculte.id}-002",
            defaults={
                'prenom': 'Marie', 'nom': 'Curie', 'email': f'm.curie{faculte.id}@univ.edu',
                'telephone': '622000002', 'specialite': 'Mathématiques Appliquées',
                'grade_academique': 'Professeur', 'type': 'Etranger',
                'departement': dept2
            }
        )
        
        # Enseignements
        enseignement1, _ = Enseignement.objects.get_or_create(
            enseignant=ens1, matiere=mat_algo, classe=classe_l1_info,
            semestre=semestres_objs[0], annee_academique=annee
        )
        enseignement2, _ = Enseignement.objects.get_or_create(
            enseignant=ens1, matiere=mat_web, classe=classe_l2_info,
            semestre=semestres_objs[1], annee_academique=annee
        )
        enseignement3, _ = Enseignement.objects.get_or_create(
            enseignant=ens2, matiere=mat_alg, classe=classe_l1_math,
            semestre=semestres_objs[0], annee_academique=annee
        )
        
        # Emploi du temps
        # Cours 1: Lundi 8h-10h
        EmploiDuTemps.objects.get_or_create(
            jour='Lundi', heure_debut=time(8, 0), heure_fin=time(10, 0),
            enseignement=enseignement1, defaults={'salle': salle1}
        )
        # Cours 2: Mardi 10h-12h
        EmploiDuTemps.objects.get_or_create(
            jour='Mardi', heure_debut=time(10, 0), heure_fin=time(12, 0),
            enseignement=enseignement2, defaults={'salle': salle3}
        )
        # Cours 3: Mercredi 14h-16h
        EmploiDuTemps.objects.get_or_create(
            jour='Mercredi', heure_debut=time(14, 0), heure_fin=time(16, 0),
            enseignement=enseignement3, defaults={'salle': salle2}
        )

    print("\n✅ Base de données remplie avec succès avec des données fictives !")

if __name__ == '__main__':
    seed_data()
