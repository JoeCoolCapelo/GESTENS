from rest_framework import viewsets, status, permissions
from datetime import time, datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes as perm_classes, action
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Faculte, AnneeAcademique, Salle, Departement, Enseignant, Classe, Matiere, Semestre, Enseignement, EmploiDuTemps, UserProfile, Universite, RecentActivity
from .serializers import (
    FaculteSerializer, AnneeAcademiqueSerializer, SalleSerializer,
    DepartementSerializer, EnseignantSerializer,
    ClasseSerializer, MatiereSerializer, SemestreSerializer,
    EnseignementSerializer, EmploiDuTempsSerializer,
    UserSerializer, RecentActivitySerializer, UniversiteSerializer
)
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from io import BytesIO

def log_activity(user, description, target_name=None, action_type='info'):
    """Helper pour enregistrer une activité récente."""
    faculte = None
    if not user.is_superuser:
        try:
            faculte = user.profile.faculte
        except:
            pass
    RecentActivity.objects.create(
        user=user,
        description=description,
        target_name=target_name,
        action_type=action_type,
        faculte=faculte
    )

class CustomLoginView(APIView):
    """Login personnalisé : vérifie identifiants + appartenance à la faculté."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        faculty_id = request.data.get('faculty_id')

        if not username or not password:
            return Response(
                {'detail': 'Identifiant et mot de passe sont requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authentifier l'utilisateur
        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {'detail': 'Identifiants invalides.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_superuser and not faculty_id:
            return Response(
                {'detail': 'La sélection de la faculté est requise.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.is_superuser:
            faculte = None
        else:
            try:
                faculte_profile = user.profile.faculte
                if str(faculte_profile.id) != str(faculty_id):
                    return Response(
                        {'detail': 'Vous n\'appartenez pas à cette faculté.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                faculte = faculte_profile
            except UserProfile.DoesNotExist:
                return Response(
                    {'detail': 'Profil utilisateur introuvable.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser,
            },
            'faculty': {
                'id': faculte.id,
                'nom': faculte.nom,
                'email': faculte.email,
                'logo': faculte.logo.url if faculte.logo else None,
            } if faculte else None
        }

        return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@perm_classes([permissions.AllowAny])
def public_university_info(request, pk=None):
    """Informations publiques de l'université."""
    if pk:
        univ = Universite.objects.filter(pk=pk).first()
    else:
        univ = Universite.objects.first()
        
    if not univ:
        # Créer par défaut si inexistant
        univ = Universite.objects.create()
    
    return Response({
        'nom': univ.nom,
        'sigle': univ.sigle,
        'slogan': univ.slogan,
        'logo': univ.logo.url if univ.logo else None,
        'republique': univ.republique,
        'email_contact': univ.email_contact,
        'bp': univ.bp
    })

@api_view(['GET'])
@perm_classes([permissions.AllowAny])
def public_universities_list(request):
    """Liste publique des universités."""
    universities = Universite.objects.all()
    data = []
    for u in universities:
        data.append({
            'id': u.id,
            'nom': u.nom,
            'sigle': u.sigle,
            'slogan': u.slogan,
            'logo': u.logo.url if u.logo else None,
            'republique': u.republique,
            'email_contact': u.email_contact,
            'bp': u.bp
        })
    return Response(data)

@api_view(['GET'])
@perm_classes([permissions.AllowAny])
def public_faculty_list(request):
    """Liste publique des facultés (pour le dropdown de connexion)."""
    univ_id = request.GET.get('universite_id')
    faculties = Faculte.objects.all()
    if univ_id:
        faculties = faculties.filter(universite_id=univ_id)
        
    data = []
    for f in faculties:
        data.append({
            'id': f.id,
            'nom': f.nom,
            'logo': f.logo.url if f.logo else None,
            'universite_id': f.universite_id
        })
    return Response(data)

@api_view(['GET', 'PATCH'])
@perm_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Récupérer ou mettre à jour le profil de l'utilisateur connecté."""
    user = request.user
    
    # S'assurer que le profil existe dans tous les cas
    profile, created = UserProfile.objects.get_or_create(
        user=user, 
        defaults={'faculte': Faculte.objects.first()}
    )

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        # Mise à jour du User (email seulement pour l'instant)
        email = request.data.get('email')
        if email:
            user.email = email
            user.save()
            
        # Mise à jour du Profile (photo)
        # S'assurer que le profil existe (cas des superusers créés manuellement)
        profile, created = UserProfile.objects.get_or_create(
            user=user, 
            defaults={'faculte': Faculte.objects.first()}
        )
        
        photo = request.FILES.get('photo')
        if photo:
            profile.photo = photo
            profile.save()
            
        serializer = UserSerializer(user)
        log_activity(user, "a mis à jour son profil", user.username, 'update')
        return Response(serializer.data)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        with transaction.atomic():
            # Step 1: Create User
            user_data = {
                'username': request.data.get('username'),
                'email': request.data.get('email'),
                'password': request.data.get('password')
            }
            user_serializer = UserSerializer(data=user_data)
            if not user_serializer.is_valid():
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password']
            )

            # Step 2: Link User to selected Faculty
            faculty_id = request.data.get('faculty_id')
            if not faculty_id:
                return Response({'detail': 'La sélection de la faculté est obligatoire.'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                faculte = Faculte.objects.get(id=faculty_id)
            except Faculte.DoesNotExist:
                return Response({'detail': 'Faculté introuvable.'}, status=status.HTTP_404_NOT_FOUND)
            
            UserProfile.objects.create(user=user, faculte=faculte)
            log_activity(user, "s'est inscrit sur la plateforme", user.username, 'create')

            return Response({"message": "Compte créé avec succès"}, status=status.HTTP_201_CREATED)

class FaculteViewSet(viewsets.ModelViewSet):
    serializer_class = FaculteSerializer
    def get_queryset(self):
        if self.request.user.is_superuser:
            return Faculte.objects.all()
        return Faculte.objects.filter(users__user=self.request.user)
    def perform_create(self, serializer):
        with transaction.atomic():
            # Vérifier si le nom d'utilisateur est déjà pris AVANT de créer la faculté
            admin_username = self.request.data.get('admin_username')
            admin_password = self.request.data.get('admin_password')
            
            if admin_username and admin_password:
                from rest_framework.exceptions import ValidationError
                if User.objects.filter(username=admin_username).exists():
                    raise ValidationError({'detail': f"L'identifiant '{admin_username}' est déjà utilisé par un autre compte."})
            
            obj = serializer.save()
            log_activity(self.request.user, "a créé la faculté", obj.nom, 'create')
            
            # Création du responsable de la faculté
            if admin_username and admin_password:
                user = User.objects.create_user(
                    username=admin_username,
                    email=obj.email,
                    password=admin_password
                )
                UserProfile.objects.create(user=user, faculte=obj)
                log_activity(self.request.user, "a créé le compte responsable", admin_username, 'create')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié la faculté", obj.nom, 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé la faculté", instance.nom, 'delete')
        instance.delete()

class UniversiteViewSet(viewsets.ModelViewSet):
    serializer_class = UniversiteSerializer
    queryset = Universite.objects.all()

    def perform_create(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a créé l'université", obj.nom, 'create')

    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié l'université", obj.nom, 'update')

    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé l'université", instance.nom, 'delete')
        instance.delete()

class AnneeAcademiqueViewSet(viewsets.ModelViewSet):
    queryset = AnneeAcademique.objects.all().order_by('-is_current', '-nom') # Montrer la courante en haut
    serializer_class = AnneeAcademiqueSerializer

    def get_queryset(self):
        return AnneeAcademique.objects.all().order_by('-is_current', '-nom')

    @action(detail=True, methods=['post'])
    def set_current(self, request, pk=None):
        """Définit cette année comme l'année académique actuelle."""
        with transaction.atomic():
            AnneeAcademique.objects.all().update(is_current=False)
            obj = self.get_object()
            obj.is_current = True
            obj.save()
            log_activity(request.user, "a activé l'année académique", obj.nom, 'update')
            return Response({'status': f"Année {obj.nom} activée"})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Désactive l'année académique sélectionnée."""
        obj = self.get_object()
        obj.is_current = False
        obj.save()
        log_activity(request.user, "a désactivé l'année académique", obj.nom, 'update')
        return Response({'status': f"Année {obj.nom} désactivée"})

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Récupère l'année académique actuelle."""
        obj = AnneeAcademique.objects.filter(is_current=True).first()
        if not obj: return Response({'detail': 'Aucune année active'}, status=404)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def perform_create(self, serializer):
        nom = serializer.validated_data.get('nom')
        import re
        from datetime import datetime
        from rest_framework.exceptions import ValidationError
        
        match = re.match(r'^(\d{4})-(\d{4})$', nom)
        if not match:
            raise ValidationError("Le format doit être YYYY-YYYY (ex: 2024-2025)")
        
        start_year = int(match.group(1))
        current_year = datetime.now().year
        if start_year < current_year - 1:
            raise ValidationError(f"Vous ne pouvez pas ajouter une année déjà passée (inférieure à {current_year}).")

        obj = serializer.save()
        log_activity(self.request.user, "a créé l'année académique", obj.nom, 'create')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié l'année académique", obj.nom, 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé l'année académique", instance.nom, 'delete')
        instance.delete()
    # Les années sont globales pour de meilleures statistiques inter-facultés

class SalleViewSet(viewsets.ModelViewSet):
    serializer_class = SalleSerializer
    def get_queryset(self):
        if self.request.user.is_superuser: return Salle.objects.all()
        return Salle.objects.filter(faculte=self.request.user.profile.faculte)
    def perform_create(self, serializer):
        faculte = self.request.user.profile.faculte if not self.request.user.is_superuser else serializer.validated_data.get('faculte')
        obj = serializer.save(faculte=faculte)
        log_activity(self.request.user, "a créé la salle", obj.nom, 'create')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié la salle", obj.nom, 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé la salle", instance.nom, 'delete')
        instance.delete()

class DepartementViewSet(viewsets.ModelViewSet):
    serializer_class = DepartementSerializer
    def get_queryset(self):
        if self.request.user.is_superuser: return Departement.objects.all()
        return Departement.objects.filter(faculte=self.request.user.profile.faculte)
    def perform_create(self, serializer):
        faculte = self.request.user.profile.faculte if not self.request.user.is_superuser else serializer.validated_data.get('faculte')
        obj = serializer.save(faculte=faculte)
        log_activity(self.request.user, "a créé le département", obj.nom, 'create')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié le département", obj.nom, 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé le département", instance.nom, 'delete')
        instance.delete()

class EnseignantViewSet(viewsets.ModelViewSet):
    serializer_class = EnseignantSerializer
    def get_queryset(self):
        if self.request.user.is_superuser: return Enseignant.objects.all()
        return Enseignant.objects.filter(departement__faculte=self.request.user.profile.faculte)
    def perform_create(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a ajouté l'enseignant", f"{obj.prenom} {obj.nom}", 'create')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié l'enseignant", f"{obj.prenom} {obj.nom}", 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé l'enseignant", f"{instance.prenom} {instance.nom}", 'delete')
        instance.delete()

class ClasseViewSet(viewsets.ModelViewSet):
    serializer_class = ClasseSerializer
    def get_queryset(self):
        if self.request.user.is_superuser: return Classe.objects.all()
        return Classe.objects.filter(departement__faculte=self.request.user.profile.faculte)
    def perform_create(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a créé la classe", obj.nom, 'create')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié la classe", obj.nom, 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé la classe", instance.nom, 'delete')
        instance.delete()

class MatiereViewSet(viewsets.ModelViewSet):
    serializer_class = MatiereSerializer
    def get_queryset(self):
        if self.request.user.is_superuser: return Matiere.objects.all()
        return Matiere.objects.filter(departement__faculte=self.request.user.profile.faculte)
    def perform_create(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a ajouté la matière", obj.nom, 'create')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié la matière", obj.nom, 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé la matière", instance.nom, 'delete')
        instance.delete()

class SemestreViewSet(viewsets.ModelViewSet):
    queryset = Semestre.objects.all()
    serializer_class = SemestreSerializer
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié le semestre", obj.nom, 'update')

class EnseignementViewSet(viewsets.ModelViewSet):
    serializer_class = EnseignementSerializer
    def get_queryset(self):
        qs = Enseignement.objects.all()
        if not self.request.user.is_superuser:
            qs = qs.filter(classe__departement__faculte=self.request.user.profile.faculte)
        
        # Filtrage par année académique (par défaut l'actuelle)
        annee_id = self.request.query_params.get('annee_academique')
        if annee_id:
            qs = qs.filter(annee_academique_id=annee_id)
        elif self.request.query_params.get('all_years') != 'true':
            current_year = AnneeAcademique.objects.filter(is_current=True).first()
            if current_year:
                qs = qs.filter(annee_academique=current_year)
            else:
                qs = qs.none() # Masquer tout si aucune année n'est active
        return qs

    def perform_create(self, serializer):
        # Assigner l'année actuelle si non spécifiée
        annee = serializer.validated_data.get('annee_academique')
        if not annee:
            annee = AnneeAcademique.objects.filter(is_current=True).first()
        
        obj = serializer.save(annee_academique=annee)
        log_activity(self.request.user, "a créé un enseignement", f"{obj.enseignant} -> {obj.matiere} ({obj.annee_academique})", 'create')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity(self.request.user, "a modifié un enseignement", f"{obj.enseignant} -> {obj.matiere}", 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé un enseignement", f"{instance.enseignant}", 'delete')
        instance.delete()

class EmploiDuTempsViewSet(viewsets.ModelViewSet):
    serializer_class = EmploiDuTempsSerializer

    def get_queryset(self):
        qs = EmploiDuTemps.objects.all()
        if not self.request.user.is_superuser:
            qs = qs.filter(enseignement__classe__departement__faculte=self.request.user.profile.faculte)
        
        # Filtrage par année académique (par défaut l'actuelle via l'enseignement lié)
        annee_id = self.request.query_params.get('annee_academique')
        if annee_id:
            qs = qs.filter(enseignement__annee_academique_id=annee_id)
        elif self.request.query_params.get('all_years') != 'true':
            current_year = AnneeAcademique.objects.filter(is_current=True).first()
            if current_year:
                qs = qs.filter(enseignement__annee_academique=current_year)
            else:
                qs = qs.none() # Masquer tout si aucune année n'est active
        return qs

    def validate_conflict(self, data, instance=None):
        jour = data.get('jour')
        heure_debut = data.get('heure_debut')
        heure_fin = data.get('heure_fin')
        salle = data.get('salle')
        enseignement = data.get('enseignement')

        if not jour or not heure_debut or not heure_fin or not enseignement:
            return

        # Conflit de salle
        if salle:
            conflicts_salle = EmploiDuTemps.objects.filter(
                jour=jour,
                salle=salle,
                heure_debut__lt=heure_fin,
                heure_fin__gt=heure_debut
            )
            if instance:
                conflicts_salle = conflicts_salle.exclude(pk=instance.pk)
            if conflicts_salle.exists():
                raise serializers.ValidationError({"salle": "Cette salle est déjà occupée sur ce créneau."})

        # Conflit d'enseignant
        enseignant = enseignement.enseignant
        conflicts_enseignant = EmploiDuTemps.objects.filter(
            jour=jour,
            enseignement__enseignant=enseignant,
            heure_debut__lt=heure_fin,
            heure_fin__gt=heure_debut
        )
        if instance:
            conflicts_enseignant = conflicts_enseignant.exclude(pk=instance.pk)
        if conflicts_enseignant.exists():
            raise serializers.ValidationError({"enseignement": f"L'enseignant {enseignant} a déjà un cours sur ce créneau."})

        # Conflit de classe
        classe = enseignement.classe
        conflicts_classe = EmploiDuTemps.objects.filter(
            jour=jour,
            enseignement__classe=classe,
            heure_debut__lt=heure_fin,
            heure_fin__gt=heure_debut
        )
        if instance:
            conflicts_classe = conflicts_classe.exclude(pk=instance.pk)
        if conflicts_classe.exists():
            raise serializers.ValidationError({"enseignement": f"La classe {classe} a déjà un cours sur ce créneau."})

    def perform_create(self, serializer):
        self.validate_conflict(serializer.validated_data)
        obj = serializer.save()
        log_activity(self.request.user, "a ajouté un créneau à l'emploi du temps", f"{obj.jour} ({obj.heure_debut})", 'create')

    def perform_update(self, serializer):
        self.validate_conflict(serializer.validated_data, instance=serializer.instance)
        obj = serializer.save()
        log_activity(self.request.user, "a modifié un créneau de l'emploi du temps", f"{obj.jour} ({obj.heure_debut})", 'update')
    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé un créneau de l'emploi du temps", f"{instance.jour}", 'delete')
        instance.delete()

class UserViewSet(viewsets.ModelViewSet):
    """Gestion des utilisateurs."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        # On retourne les utilisateurs de la même faculté
        return User.objects.filter(profile__faculte=self.request.user.profile.faculte)

    def perform_create(self, serializer):
        with transaction.atomic():
            faculte_id = self.request.data.get('faculte_id')
            password = self.request.data.get('password')
            user = serializer.save()
            if password:
                user.set_password(password)
                user.save()
            
            if faculte_id:
                try:
                    faculte = Faculte.objects.get(id=faculte_id)
                    UserProfile.objects.create(user=user, faculte=faculte)
                except Faculte.DoesNotExist:
                    pass
            log_activity(self.request.user, "a créé l'utilisateur", user.username, 'create')

    def perform_update(self, serializer):
        with transaction.atomic():
            faculte_id = self.request.data.get('faculte_id')
            password = self.request.data.get('password')
            user = serializer.save()
            
            if password:
                user.set_password(password)
                user.save()
                
            if faculte_id:
                try:
                    faculte = Faculte.objects.get(id=faculte_id)
                    UserProfile.objects.update_or_create(user=user, defaults={'faculte': faculte})
                except Faculte.DoesNotExist:
                    pass
            log_activity(self.request.user, "a modifié l'utilisateur", user.username, 'update')

    def perform_destroy(self, instance):
        log_activity(self.request.user, "a supprimé l'utilisateur", instance.username, 'delete')
        instance.delete()

class RecentActivityViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RecentActivitySerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return RecentActivity.objects.filter(is_archived=False)
        try:
            return RecentActivity.objects.filter(
                faculte=self.request.user.profile.faculte,
                is_archived=False
            )
        except Exception:
            return RecentActivity.objects.none()

    def get_permissions(self):
        # Permettre aux responsables de voir et gérer leurs propres activités/archives
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['patch', 'post'])
    def archive(self, request, pk=None):
        """Archiver une activité spécifique."""
        activity = self.get_object()
        activity.is_archived = True
        activity.save()
        return Response({'status': 'activité archivée'})

    @action(detail=True, methods=['patch', 'post'])
    def restore(self, request, pk=None):
        """Désarchiver une activité spécifique."""
        activity = self.get_object()
        activity.is_archived = False
        activity.save()
        return Response({'status': 'activité restaurée'})

    @action(detail=False, methods=['post'])
    def archive_all(self, request):
        """Archiver toutes les activités visibles de l'utilisateur."""
        qs = self.get_queryset()
        qs.update(is_archived=True)
        return Response({'status': 'toutes les activités ont été archivées'})

    @action(detail=False, methods=['get'])
    def archived(self, request):
        """Voir la liste des activités archivées."""
        if request.user.is_superuser:
            qs = RecentActivity.objects.filter(is_archived=True)
        else:
            qs = RecentActivity.objects.filter(
                faculte=request.user.profile.faculte,
                is_archived=True
            )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@perm_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Statistiques avancées pour le tableau de bord."""
    try:
        if (request.user.is_superuser):
            faculte = None
        else:
            faculte = getattr(request.user, 'profile', None)
            if faculte:
                faculte = faculte.faculte
    except Exception:
        faculte = None
    
    # from datetime import datetime <- REMOVED from here
    
    # Filtres de base
    filter_kwargs = {'departement__faculte': faculte} if faculte else {}
    emploi_filter = {'enseignement__classe__departement__faculte': faculte} if faculte else {}
    
    # 1. Répartition des enseignants par type
    teachers_by_type = Enseignant.objects.filter(**filter_kwargs).values('type').annotate(count=Count('id'))
    
    # 2. Répartition par grade
    teachers_by_grade = Enseignant.objects.filter(**filter_kwargs).values('grade_academique').annotate(count=Count('id'))
    
    # 3. Volume horaire par département (basé sur l'emploi du temps)
    # Note: On simplifie en comptant les créneaux
    dept_hours = Departement.objects.filter(faculte=faculte) if faculte else Departement.objects.all()
    hours_stats = []
    for dept in dept_hours:
        count = EmploiDuTemps.objects.filter(enseignement__matiere__departement=dept).count()
        hours_stats.append({'name': dept.nom, 'count': count * 2}) # On estime 2h par créneau
        
    # 4. Taux d'occupation des salles
    total_rooms = Salle.objects.filter(faculte=faculte).count() if faculte else Salle.objects.count()
    occupied_slots = EmploiDuTemps.objects.filter(salle__faculte=faculte).count() if faculte else EmploiDuTemps.objects.count()
    room_occupancy_pct = min(100, round((occupied_slots * 2) / max(1, total_rooms * 40) * 100)) # 40h max par salle
    
    # 5. Top 5 des Enseignants les plus sollicités
    top_teachers = Enseignant.objects.filter(**filter_kwargs).annotate(
        hours=Count('enseignements__horaires') * 2
    ).order_by('-hours')[:5]
    top_teachers_data = [{'name': f"{t.prenom} {t.nom}", 'hours': t.hours} for t in top_teachers if t.hours > 0]
    
    # 6. Répartition des classes par niveau
    classes_by_level = Classe.objects.filter(**filter_kwargs).values('niveau').annotate(count=Count('id'))
    
    # 7. Cours en cours (Aujourd'hui)
    days_fr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    today_fr = days_fr[datetime.now().weekday()]
    today_classes = EmploiDuTemps.objects.filter(**emploi_filter, jour=today_fr).select_related(
        'enseignement__matiere', 'enseignement__classe', 'enseignement__enseignant', 'salle'
    ).order_by('heure_debut')[:10]
    today_classes_data = [{
        'id': c.id,
        'heure_debut': c.heure_debut.strftime('%H:%M'),
        'heure_fin': c.heure_fin.strftime('%H:%M'),
        'matiere': c.enseignement.matiere.nom,
        'classe': c.enseignement.classe.nom,
        'enseignant': f"{c.enseignement.enseignant.prenom} {c.enseignement.enseignant.nom}",
        'salle': c.salle.nom if c.salle else "Non assignée"
    } for c in today_classes]
    
    # 8. Alertes : Matières sans professeur assigné (Aucun enseignement lié)
    unassigned_subjects = Matiere.objects.filter(**filter_kwargs, enseignements__isnull=True).distinct()[:5]
    unassigned_data = [{'id': m.id, 'nom': m.nom, 'code': m.code} for m in unassigned_subjects]
    
    return Response({
        'teachers_by_type': list(teachers_by_type),
        'teachers_by_grade': list(teachers_by_grade),
        'hours_by_dept': hours_stats,
        'room_occupancy_pct': room_occupancy_pct,
        'top_teachers': top_teachers_data,
        'classes_by_level': list(classes_by_level),
        'today_classes': today_classes_data,
        'unassigned_subjects': unassigned_data,
        'global': {
            'total_teachers': Enseignant.objects.filter(**filter_kwargs).count(),
            'total_departments': Departement.objects.filter(faculte=faculte).count() if faculte else Departement.objects.count(),
            'total_rooms': total_rooms,
            'total_classes': Classe.objects.filter(**filter_kwargs).count(),
        }
    })

@api_view(['GET'])
@perm_classes([permissions.IsAuthenticated])
def export_teachers_pdf(request):
    """Exportation de la liste des enseignants en PDF."""
    faculte = None if request.user.is_superuser else request.user.profile.faculte
    dept_id = request.GET.get('departement')
    
    qs = Enseignant.objects.all()
    if faculte:
        qs = qs.filter(departement__faculte=faculte)
    if dept_id:
        qs = qs.filter(departement_id=dept_id)
        
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    title = f"LISTE DES ENSEIGNANTS - {faculte.nom if faculte else 'UNIVERSITÉ'}"
    elements.append(Paragraph(title, styles['Title']))
    elements.append(Spacer(1, 12))
    
    data = [['Matricule', 'Prénom & Nom', 'Spécialité', 'Grade', 'Type']]
    for e in qs:
        data.append([e.matricule, f"{e.prenom} {e.nom}", e.specialite or '-', e.grade_academique or '-', e.type])
        
    t = Table(data, colWidths=[80, 150, 120, 80, 60])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(t)
    doc.build(elements)
    
    pdf = buffer.getvalue()
    buffer.close()
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="enseignants.pdf"'
    response.write(pdf)
    return response

@api_view(['GET'])
@perm_classes([permissions.IsAuthenticated])
def export_schedule_pdf(request):
    """Exportation de l'emploi du temps en PDF (Format Paysage)."""
    faculte = request.user.profile.faculte
    classe_id = request.GET.get('classe')
    
    if not classe_id:
        return Response({'detail': 'Classe requise.'}, status=400)
        
    classe = Classe.objects.get(id=classe_id)
    schedules = EmploiDuTemps.objects.filter(enseignement__classe=classe).order_by('heure_debut')
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    elements = []
    styles = getSampleStyleSheet()
    
    elements.append(Paragraph(f"EMPLOI DU TEMPS : {classe.nom} ({classe.niveau})", styles['Title']))
    elements.append(Paragraph(f"Faculté : {faculte.nom}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    data = [['Heure', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']]
    
    # Créneaux types
    slots = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00"]
    
    for slot in slots:
        row = [slot]
        h_start = slot.split(' - ')[0]
        h_start_obj = time(int(h_start.split(':')[0]), int(h_start.split(':')[1]))
        for day in days:
            match = schedules.filter(jour=day, heure_debut=h_start_obj).first()
            if match:
                txt = f"{match.enseignement.matiere.nom}\n({match.enseignement.enseignant.nom})\n{match.salle.nom if match.salle else ''}"
                row.append(txt)
            else:
                row.append('')
        data.append(row)
        
    t = Table(data, colWidths=[80, 110, 110, 110, 110, 110, 110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
    ]))
    elements.append(t)
    doc.build(elements)
    
    pdf = buffer.getvalue()
    buffer.close()
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="emploi_du_temps_{classe.nom}.pdf"'
    response.write(pdf)
    return response
