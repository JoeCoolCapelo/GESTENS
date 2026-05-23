import os
import django
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestens_backend.settings')
django.setup()

from management.models import Faculte, Universite, Enseignant, Departement, Classe, Matiere, Enseignement, EmploiDuTemps, RecentActivity, UserProfile
from django.contrib.auth.models import User

print("--- Database Stats ---")
print(f"Users: {User.objects.count()}")
print(f"Profiles: {UserProfile.objects.count()}")
print(f"Faculties: {Faculte.objects.count()}")
print(f"Teachers: {Enseignant.objects.count()}")
print(f"Departments: {Departement.objects.count()}")
print(f"Classes: {Classe.objects.count()}")
print(f"Subjects: {Matiere.objects.count()}")
print(f"Teachings: {Enseignement.objects.count()}")
print(f"Schedules: {EmploiDuTemps.objects.count()}")
print(f"Activities: {RecentActivity.objects.count()}")

print("\n--- Detailed Faculties ---")
for f in Faculte.objects.all():
    print(f"ID: {f.id}, Nom: {f.nom}")

print("\n--- User Profiles ---")
for p in UserProfile.objects.all():
    print(f"User: {p.user.username}, Faculty: {p.faculte.nom if p.faculte else 'None'}")

print("\n--- Orphaned Data Check ---")
print(f"Teachers without Faculty: {Enseignant.objects.filter(departement__faculte__isnull=True).count()}")
print(f"Departments without Faculty: {Departement.objects.filter(faculte__isnull=True).count()}")
print(f"Schedules without Faculty: {EmploiDuTemps.objects.filter(enseignement__classe__departement__faculte__isnull=True).count()}")
print(f"Activities without Faculty: {RecentActivity.objects.filter(faculte__isnull=True).count()}")

print("\n--- Activity Log Sample ---")
for act in RecentActivity.objects.all()[:10]:
    print(f"Act: {act.description}, Faculty: {act.faculte.nom if act.faculte else 'Global/None'}")
