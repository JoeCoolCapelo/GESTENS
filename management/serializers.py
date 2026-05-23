from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Faculte, AnneeAcademique, Salle, Departement, Enseignant, Classe, Matiere, Semestre, Enseignement, EmploiDuTemps, UserProfile, RecentActivity, Universite

class UniversiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Universite
        fields = '__all__'

class FaculteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculte
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    faculte_details = FaculteSerializer(source='faculte', read_only=True)
    class Meta:
        model = UserProfile
        fields = ('id', 'faculte', 'faculte_details', 'photo')

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    faculte_id = serializers.IntegerField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_superuser', 'profile', 'faculte_id')
        extra_kwargs = {
            'password': {'write_only': True}
        }


class AnneeAcademiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnneeAcademique
        fields = '__all__'

class SalleSerializer(serializers.ModelSerializer):
    faculte_details = FaculteSerializer(source='faculte', read_only=True)
    class Meta:
        model = Salle
        fields = '__all__'

class DepartementSerializer(serializers.ModelSerializer):
    faculte_details = FaculteSerializer(source='faculte', read_only=True)
    class Meta:
        model = Departement
        fields = '__all__'

class EnseignantSerializer(serializers.ModelSerializer):
    departement_details = DepartementSerializer(source='departement', read_only=True)
    class Meta:
        model = Enseignant
        fields = '__all__'

class ClasseSerializer(serializers.ModelSerializer):
    departement_details = DepartementSerializer(source='departement', read_only=True)
    class Meta:
        model = Classe
        fields = '__all__'

class MatiereSerializer(serializers.ModelSerializer):
    departement_details = DepartementSerializer(source='departement', read_only=True)
    class Meta:
        model = Matiere
        fields = '__all__'

class SemestreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semestre
        fields = '__all__'

class EnseignementSerializer(serializers.ModelSerializer):
    enseignant_details = EnseignantSerializer(source='enseignant', read_only=True)
    matiere_details = MatiereSerializer(source='matiere', read_only=True)
    classe_details = ClasseSerializer(source='classe', read_only=True)
    semestre_details = SemestreSerializer(source='semestre', read_only=True)
    annee_details = AnneeAcademiqueSerializer(source='annee_academique', read_only=True)
    class Meta:
        model = Enseignement
        fields = '__all__'

from django.db.models import Q

class EmploiDuTempsSerializer(serializers.ModelSerializer):
    enseignement_details = EnseignementSerializer(source='enseignement', read_only=True)
    salle_details = SalleSerializer(source='salle', read_only=True)
    
    class Meta:
        model = EmploiDuTemps
        fields = '__all__'

    def validate(self, data):
        """Vérifie les conflits d'emploi du temps."""
        jour = data.get('jour')
        heure_debut = data.get('heure_debut')
        heure_fin = data.get('heure_fin')
        enseignement = data.get('enseignement')
        salle = data.get('salle')

        if not jour or not heure_debut or not heure_fin or not enseignement:
            return data

        # 1. Vérification de la cohérence des heures
        if heure_debut >= heure_fin:
            raise serializers.ValidationError("L'heure de début doit être antérieure à l'heure de fin.")

        # Préparer le filtre de base pour l'overlap
        # (StartA < EndB) and (EndA > StartB)
        overlap_filter = Q(
            jour=jour,
            heure_debut__lt=heure_fin,
            heure_fin__gt=heure_debut
        )

        # Si c'est une mise à jour, exclure l'instance actuelle
        if self.instance:
            overlap_filter &= ~Q(id=self.instance.id)

        # 2. Conflit Enseignant
        teacher_conflict = EmploiDuTemps.objects.filter(
            overlap_filter,
            enseignement__enseignant=enseignement.enseignant
        ).first()
        if teacher_conflict:
            raise serializers.ValidationError(
                f"Conflit Enseignant : {enseignement.enseignant} est déjà occupé de "
                f"{teacher_conflict.heure_debut} à {teacher_conflict.heure_fin}."
            )

        # 3. Conflit Salle (si une salle est spécifiée)
        if salle:
            room_conflict = EmploiDuTemps.objects.filter(
                overlap_filter,
                salle=salle
            ).first()
            if room_conflict:
                raise serializers.ValidationError(
                    f"Conflit Salle : La salle {salle.nom} est déjà occupée de "
                    f"{room_conflict.heure_debut} à {room_conflict.heure_fin}."
                )

        # 4. Conflit Classe
        class_conflict = EmploiDuTemps.objects.filter(
            overlap_filter,
            enseignement__classe=enseignement.classe
        ).first()
        if class_conflict:
            raise serializers.ValidationError(
                f"Conflit Classe : La classe {enseignement.classe} a déjà un cours de "
                f"{class_conflict.heure_debut} à {class_conflict.heure_fin}."
            )

        return data

class RecentActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    faculte_name = serializers.ReadOnlyField(source='faculte.nom')
    
    class Meta:
        model = RecentActivity
        fields = ('id', 'user', 'user_name', 'description', 'target_name', 'action_type', 'timestamp', 'faculte_name')
