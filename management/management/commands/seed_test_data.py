"""
Commande Django pour insérer des données d'essai réalistes dans la base de données.
5 Universités, 2+ départements par faculté, enseignants, classes, matières, etc.
"""
import random
from datetime import date, time
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from management.models import (
    Universite, Faculte, Departement, Enseignant, Classe, Matiere,
    Semestre, AnneeAcademique, Salle, Enseignement, EmploiDuTemps,
    SeancePointage, UserProfile, RecentActivity
)


class Command(BaseCommand):
    help = "Insère des données d'essai complètes dans la base de données"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("🗑️  Suppression des anciennes données..."))
        # Supprimer dans l'ordre inverse des dépendances
        SeancePointage.objects.all().delete()
        EmploiDuTemps.objects.all().delete()
        Enseignement.objects.all().delete()
        RecentActivity.objects.all().delete()
        UserProfile.objects.all().delete()
        Enseignant.objects.all().delete()
        Classe.objects.all().delete()
        Matiere.objects.all().delete()
        Salle.objects.all().delete()
        Departement.objects.all().delete()
        Faculte.objects.all().delete()
        Universite.objects.all().delete()
        Semestre.objects.all().delete()
        AnneeAcademique.objects.all().delete()
        # Supprimer les utilisateurs non-superuser
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write(self.style.SUCCESS("✅ Base nettoyée."))

        # ============================================================
        # 1. UNIVERSITÉS (5)
        # ============================================================
        universites_data = [
            {
                "nom": "Université Gamal Abdel Nasser de Conakry",
                "sigle": "UGANC",
                "slogan": "Le temple du savoir",
                "republique": "RÉPUBLIQUE DE GUINÉE",
                "email_contact": "info@uganc.edu.gn",
                "bp": "BP: 1147 Conakry",
            },
            {
                "nom": "Université Julius Nyerere de Kankan",
                "sigle": "UJNK",
                "slogan": "L'excellence par le savoir",
                "republique": "RÉPUBLIQUE DE GUINÉE",
                "email_contact": "contact@ujnk.edu.gn",
                "bp": "BP: 209 Kankan",
            },
            {
                "nom": "Université de Labé",
                "sigle": "ULAB",
                "slogan": "Savoir, Innover, Servir",
                "republique": "RÉPUBLIQUE DE GUINÉE",
                "email_contact": "info@ulabe.edu.gn",
                "bp": "BP: 102 Labé",
            },
            {
                "nom": "Université de N'Zérékoré",
                "sigle": "UNZK",
                "slogan": "Former pour développer",
                "republique": "RÉPUBLIQUE DE GUINÉE",
                "email_contact": "info@unzk.edu.gn",
                "bp": "BP: 50 N'Zérékoré",
            },
            {
                "nom": "Université Kofi Annan de Guinée",
                "sigle": "UKAG",
                "slogan": "L'avenir se construit ici",
                "republique": "RÉPUBLIQUE DE GUINÉE",
                "email_contact": "info@ukag.edu.gn",
                "bp": "BP: 300 Conakry",
            },
        ]

        universites = []
        for u_data in universites_data:
            u = Universite.objects.create(**u_data)
            universites.append(u)
            self.stdout.write(f"  🏛️  Université: {u.nom}")

        # ============================================================
        # 2. FACULTÉS (2-3 par université)
        # ============================================================
        facultes_data = {
            0: [  # UGANC
                {"nom": "Faculté des Sciences", "email": "sciences@uganc.edu.gn"},
                {"nom": "Faculté des Lettres et Sciences Humaines", "email": "lettres@uganc.edu.gn"},
                {"nom": "Faculté de Médecine", "email": "medecine@uganc.edu.gn"},
            ],
            1: [  # UJNK
                {"nom": "Faculté des Sciences Sociales", "email": "sociales@ujnk.edu.gn"},
                {"nom": "Faculté d'Agronomie", "email": "agro@ujnk.edu.gn"},
            ],
            2: [  # ULAB
                {"nom": "Faculté des Sciences de l'Éducation", "email": "education@ulabe.edu.gn"},
                {"nom": "Faculté de Droit", "email": "droit@ulabe.edu.gn"},
            ],
            3: [  # UNZK
                {"nom": "Faculté des Sciences de l'Environnement", "email": "env@unzk.edu.gn"},
                {"nom": "Faculté de Génie Civil", "email": "gc@unzk.edu.gn"},
            ],
            4: [  # UKAG
                {"nom": "Faculté d'Informatique et des TIC", "email": "info@ukag.edu.gn"},
                {"nom": "Faculté de Gestion et Commerce", "email": "gestion@ukag.edu.gn"},
                {"nom": "Faculté de Communication", "email": "com@ukag.edu.gn"},
            ],
        }

        facultes = []
        for idx, fac_list in facultes_data.items():
            for f_data in fac_list:
                f = Faculte.objects.create(
                    nom=f_data["nom"],
                    email=f_data["email"],
                    universite=universites[idx],
                )
                facultes.append(f)
                self.stdout.write(f"  📚 Faculté: {f.nom} ({universites[idx].sigle})")

        # ============================================================
        # 3. DÉPARTEMENTS (2 par faculté)
        # ============================================================
        departements_par_faculte = {
            "Faculté des Sciences": ["Département de Mathématiques", "Département de Physique"],
            "Faculté des Lettres et Sciences Humaines": ["Département de Philosophie", "Département d'Histoire"],
            "Faculté de Médecine": ["Département de Médecine Générale", "Département de Pharmacie"],
            "Faculté des Sciences Sociales": ["Département de Sociologie", "Département de Psychologie"],
            "Faculté d'Agronomie": ["Département de Productions Végétales", "Département de Zootechnie"],
            "Faculté des Sciences de l'Éducation": ["Département de Pédagogie", "Département de Didactique"],
            "Faculté de Droit": ["Département de Droit Public", "Département de Droit Privé"],
            "Faculté des Sciences de l'Environnement": ["Département d'Écologie", "Département de Géographie"],
            "Faculté de Génie Civil": ["Département de Construction", "Département d'Hydraulique"],
            "Faculté d'Informatique et des TIC": ["Département de Génie Logiciel", "Département de Réseaux et Télécoms"],
            "Faculté de Gestion et Commerce": ["Département de Comptabilité", "Département de Marketing"],
            "Faculté de Communication": ["Département de Journalisme", "Département de Relations Publiques"],
        }

        departements = []
        for f in facultes:
            deps_names = departements_par_faculte.get(f.nom, ["Département Général 1", "Département Général 2"])
            for d_name in deps_names:
                d = Departement.objects.create(
                    nom=d_name,
                    description=f"Département rattaché à {f.nom}",
                    faculte=f,
                )
                departements.append(d)
                self.stdout.write(f"    🏢 Département: {d.nom}")

        # ============================================================
        # 4. SALLES (2-3 par faculté)
        # ============================================================
        salles = []
        for i, f in enumerate(facultes):
            for j in range(1, random.randint(3, 4)):
                s = Salle.objects.create(
                    nom=f"Salle {chr(65 + i)}{j}",
                    capacite=random.choice([30, 50, 80, 100, 150, 200]),
                    faculte=f,
                )
                salles.append(s)

        self.stdout.write(f"  🚪 {len(salles)} salles créées.")

        # ============================================================
        # 5. SEMESTRES
        # ============================================================
        semestres_data = [
            ("S1", "Impair"), ("S2", "Pair"),
            ("S3", "Impair"), ("S4", "Pair"),
            ("S5", "Impair"), ("S6", "Pair"),
            ("S7", "Impair"), ("S8", "Pair"),
        ]
        semestres = []
        for nom, type_s in semestres_data:
            s = Semestre.objects.create(nom=nom, type=type_s)
            semestres.append(s)
        self.stdout.write(f"  📅 {len(semestres)} semestres créés.")

        # ============================================================
        # 6. ANNÉES ACADÉMIQUES
        # ============================================================
        annees_data = [
            ("2024-2025", False),
            ("2025-2026", True),
            ("2026-2027", False),
        ]
        annees = []
        for nom, is_current in annees_data:
            a = AnneeAcademique.objects.create(nom=nom, is_current=is_current)
            annees.append(a)
        self.stdout.write(f"  🗓️  {len(annees)} années académiques créées (active: 2025-2026).")

        # ============================================================
        # 7. ENSEIGNANTS (3-4 par département)
        # ============================================================
        prenoms = [
            "Mamadou", "Aissatou", "Ibrahima", "Fatoumata", "Ousmane",
            "Mariama", "Alpha", "Kadiatou", "Mohamed", "Aminata",
            "Sékou", "Djénabou", "Abdoulaye", "Hawa", "Thierno",
            "Nènè", "Boubacar", "Fanta", "Souleymane", "Binta",
            "Lansana", "Maïmouna", "Cellou", "Ramatoulaye", "Elhadj",
            "Safiatou", "Amadou", "Oumou", "Fodé", "Diaraye",
        ]
        noms = [
            "Diallo", "Barry", "Bah", "Camara", "Sylla",
            "Condé", "Soumah", "Touré", "Keita", "Bangoura",
            "Traoré", "Kourouma", "Savané", "Diakhaby", "Souaré",
            "Sow", "Kaba", "Fofana", "Kanté", "Doumbouya",
        ]
        grades = ["Professeur Titulaire", "Maître de Conférences", "Chargé de Cours", "Assistant", "Docteur"]
        diplomes = ["Doctorat", "PhD", "Agrégation", "DEA", "Master Recherche"]
        specialites_map = {
            "Département de Mathématiques": ["Algèbre", "Analyse Numérique", "Statistiques", "Probabilités"],
            "Département de Physique": ["Mécanique Quantique", "Optique", "Thermodynamique", "Électromagnétisme"],
            "Département de Philosophie": ["Éthique", "Métaphysique", "Philosophie Politique", "Logique"],
            "Département d'Histoire": ["Histoire Africaine", "Histoire Contemporaine", "Archéologie"],
            "Département de Médecine Générale": ["Cardiologie", "Pédiatrie", "Chirurgie", "Médecine Interne"],
            "Département de Pharmacie": ["Pharmacologie", "Toxicologie", "Galénique"],
            "Département de Sociologie": ["Sociologie Urbaine", "Sociologie Rurale", "Démographie"],
            "Département de Psychologie": ["Psychologie Clinique", "Psychologie du Développement", "Neuropsychologie"],
            "Département de Productions Végétales": ["Agrochimie", "Phytopathologie", "Génétique Végétale"],
            "Département de Zootechnie": ["Nutrition Animale", "Reproduction Animale", "Génétique Animale"],
            "Département de Pédagogie": ["Sciences de l'Éducation", "Psychopédagogie", "Évaluation"],
            "Département de Didactique": ["Didactique des Sciences", "Didactique des Langues", "Ingénierie Pédagogique"],
            "Département de Droit Public": ["Droit Constitutionnel", "Droit Administratif", "Droit International"],
            "Département de Droit Privé": ["Droit Civil", "Droit des Affaires", "Droit Pénal"],
            "Département d'Écologie": ["Biodiversité", "Conservation", "Écosystèmes Tropicaux"],
            "Département de Géographie": ["Géomatique", "Climatologie", "Géographie Humaine"],
            "Département de Construction": ["Résistance des Matériaux", "Béton Armé", "Topographie"],
            "Département d'Hydraulique": ["Hydrologie", "Mécanique des Fluides", "Assainissement"],
            "Département de Génie Logiciel": ["Programmation", "Intelligence Artificielle", "Base de Données"],
            "Département de Réseaux et Télécoms": ["Administration Réseau", "Cybersécurité", "Télécommunications"],
            "Département de Comptabilité": ["Comptabilité Générale", "Audit", "Fiscalité"],
            "Département de Marketing": ["Marketing Digital", "Études de Marché", "Communication Commerciale"],
            "Département de Journalisme": ["Rédaction", "Reportage", "Éthique des Médias"],
            "Département de Relations Publiques": ["Communication Institutionnelle", "Gestion de Crise", "Événementiel"],
        }

        enseignants = []
        matricule_counter = 1000
        used_emails = set()
        used_prenoms_noms = set()

        for d in departements:
            nb_enseignants = random.randint(3, 4)
            specialites = specialites_map.get(d.nom, ["Généraliste"])
            for _ in range(nb_enseignants):
                # Assurer l'unicité prenom+nom
                while True:
                    prenom = random.choice(prenoms)
                    nom = random.choice(noms)
                    key = f"{prenom}_{nom}"
                    if key not in used_prenoms_noms:
                        used_prenoms_noms.add(key)
                        break

                matricule_counter += 1
                email_base = f"{prenom.lower()}.{nom.lower()}".replace("é", "e").replace("è", "e").replace("ê", "e").replace("ï", "i").replace("ô", "o")
                email = f"{email_base}@edu.gn"
                counter = 1
                while email in used_emails:
                    email = f"{email_base}{counter}@edu.gn"
                    counter += 1
                used_emails.add(email)

                e = Enseignant.objects.create(
                    prenom=prenom,
                    nom=nom,
                    date_naissance=date(random.randint(1960, 1990), random.randint(1, 12), random.randint(1, 28)),
                    telephone=f"+224 6{random.randint(20, 69)} {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)}",
                    email=email,
                    specialite=random.choice(specialites),
                    dernier_diplome=random.choice(diplomes),
                    grade_academique=random.choice(grades),
                    matricule=f"ENS-{matricule_counter}",
                    fonction=random.choice(["Enseignant", "Chef de Département", "Vice-Doyen", "Enseignant-Chercheur"]),
                    type=random.choice(["National", "Etranger"]),
                    departement=d,
                )
                enseignants.append(e)

        self.stdout.write(f"  👨‍🏫 {len(enseignants)} enseignants créés.")

        # ============================================================
        # 8. CLASSES (2 par département)
        # ============================================================
        niveaux = ["L1", "L2", "L3", "M1", "M2"]
        classes = []
        for d in departements:
            niv_choices = random.sample(niveaux, 2)
            for niv in niv_choices:
                class_name = d.nom.replace("Département de ", "").replace("Département d'", "")
                c = Classe.objects.create(
                    nom=f"{class_name} {niv}",
                    niveau=niv,
                    departement=d,
                )
                classes.append(c)

        self.stdout.write(f"  🎓 {len(classes)} classes créées.")

        # ============================================================
        # 9. MATIÈRES (3 par département)
        # ============================================================
        matieres_map = {
            "Département de Mathématiques": [("MATH101", "Algèbre Linéaire"), ("MATH201", "Analyse Réelle"), ("MATH301", "Probabilités et Statistiques")],
            "Département de Physique": [("PHYS101", "Mécanique Générale"), ("PHYS201", "Électromagnétisme"), ("PHYS301", "Physique Quantique")],
            "Département de Philosophie": [("PHIL101", "Introduction à la Philosophie"), ("PHIL201", "Éthique et Morale"), ("PHIL301", "Philosophie Politique")],
            "Département d'Histoire": [("HIST101", "Histoire de l'Afrique"), ("HIST201", "Histoire Contemporaine"), ("HIST301", "Méthodes Historiques")],
            "Département de Médecine Générale": [("MED101", "Anatomie Humaine"), ("MED201", "Physiologie"), ("MED301", "Sémiologie Médicale")],
            "Département de Pharmacie": [("PHAR101", "Chimie Pharmaceutique"), ("PHAR201", "Pharmacologie Générale"), ("PHAR301", "Galénique")],
            "Département de Sociologie": [("SOC101", "Introduction à la Sociologie"), ("SOC201", "Sociologie Africaine"), ("SOC301", "Méthodes Qualitatives")],
            "Département de Psychologie": [("PSY101", "Psychologie Générale"), ("PSY201", "Psychologie du Développement"), ("PSY301", "Psychopathologie")],
            "Département de Productions Végétales": [("AGR101", "Agronomie Générale"), ("AGR201", "Phytopathologie"), ("AGR301", "Cultures Tropicales")],
            "Département de Zootechnie": [("ZOO101", "Zootechnie Générale"), ("ZOO201", "Nutrition Animale"), ("ZOO301", "Reproduction Animale")],
            "Département de Pédagogie": [("PED101", "Sciences de l'Éducation"), ("PED201", "Psychopédagogie"), ("PED301", "Évaluation Scolaire")],
            "Département de Didactique": [("DID101", "Didactique Générale"), ("DID201", "Didactique des Sciences"), ("DID301", "Ingénierie de Formation")],
            "Département de Droit Public": [("DPU101", "Droit Constitutionnel"), ("DPU201", "Droit Administratif"), ("DPU301", "Droit International Public")],
            "Département de Droit Privé": [("DPR101", "Droit Civil"), ("DPR201", "Droit des Obligations"), ("DPR301", "Droit Commercial")],
            "Département d'Écologie": [("ECO101", "Écologie Générale"), ("ECO201", "Biodiversité"), ("ECO301", "Gestion des Ressources Naturelles")],
            "Département de Géographie": [("GEO101", "Géographie Physique"), ("GEO201", "Géomatique et SIG"), ("GEO301", "Climatologie")],
            "Département de Construction": [("CON101", "Résistance des Matériaux"), ("CON201", "Béton Armé"), ("CON301", "Dessin Technique")],
            "Département d'Hydraulique": [("HYD101", "Mécanique des Fluides"), ("HYD201", "Hydrologie"), ("HYD301", "Assainissement Urbain")],
            "Département de Génie Logiciel": [("INF101", "Algorithmique"), ("INF201", "Programmation Web"), ("INF301", "Base de Données")],
            "Département de Réseaux et Télécoms": [("RES101", "Architecture des Réseaux"), ("RES201", "Administration Système"), ("RES301", "Cybersécurité")],
            "Département de Comptabilité": [("CPT101", "Comptabilité Générale"), ("CPT201", "Comptabilité Analytique"), ("CPT301", "Audit Financier")],
            "Département de Marketing": [("MKT101", "Principes du Marketing"), ("MKT201", "Marketing Digital"), ("MKT301", "Études de Marché")],
            "Département de Journalisme": [("JRN101", "Techniques de Rédaction"), ("JRN201", "Reportage et Investigation"), ("JRN301", "Éthique des Médias")],
            "Département de Relations Publiques": [("RP101", "Communication Institutionnelle"), ("RP201", "Gestion de Crise"), ("RP301", "Organisation d'Événements")],
        }

        matieres = []
        for d in departements:
            mats = matieres_map.get(d.nom, [("GEN101", "Matière Générale 1"), ("GEN201", "Matière Générale 2"), ("GEN301", "Matière Générale 3")])
            for code, nom in mats:
                m = Matiere.objects.create(nom=nom, code=code, departement=d)
                matieres.append(m)

        self.stdout.write(f"  📖 {len(matieres)} matières créées.")

        # ============================================================
        # 10. ENSEIGNEMENTS (lier enseignants, matières, classes)
        # ============================================================
        annee_courante = AnneeAcademique.objects.get(is_current=True)
        enseignements = []

        for d in departements:
            d_enseignants = [e for e in enseignants if e.departement_id == d.id]
            d_classes = [c for c in classes if c.departement_id == d.id]
            d_matieres = [m for m in matieres if m.departement_id == d.id]

            if not d_enseignants or not d_classes or not d_matieres:
                continue

            for mat in d_matieres:
                ens = random.choice(d_enseignants)
                cls = random.choice(d_classes)
                sem = random.choice(semestres[:4])  # S1-S4

                enseignement = Enseignement.objects.create(
                    enseignant=ens,
                    matiere=mat,
                    classe=cls,
                    semestre=sem,
                    annee_academique=annee_courante,
                )
                enseignements.append(enseignement)

        self.stdout.write(f"  📋 {len(enseignements)} enseignements créés.")

        # ============================================================
        # 11. EMPLOIS DU TEMPS
        # ============================================================
        jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
        creneaux = [
            (time(8, 0), time(10, 0)),
            (time(10, 15), time(12, 15)),
            (time(13, 0), time(15, 0)),
            (time(15, 15), time(17, 15)),
        ]

        emplois = []
        used_slots = set()  # (jour, heure_debut, heure_fin, salle_id)

        for enseignement in enseignements:
            fac = enseignement.classe.departement.faculte
            fac_salles = [s for s in salles if s.faculte_id == fac.id]
            if not fac_salles:
                continue

            # Assigner 1-2 créneaux par enseignement
            nb_creneaux = random.randint(1, 2)
            for _ in range(nb_creneaux):
                attempts = 0
                while attempts < 20:
                    jour = random.choice(jours)
                    h_debut, h_fin = random.choice(creneaux)
                    salle = random.choice(fac_salles)
                    slot_key = (jour, str(h_debut), str(h_fin), salle.id)

                    if slot_key not in used_slots:
                        used_slots.add(slot_key)
                        edt = EmploiDuTemps.objects.create(
                            enseignement=enseignement,
                            jour=jour,
                            heure_debut=h_debut,
                            heure_fin=h_fin,
                            salle=salle,
                        )
                        emplois.append(edt)
                        break
                    attempts += 1

        self.stdout.write(f"  ⏰ {len(emplois)} créneaux d'emploi du temps créés.")

        # ============================================================
        # 12. SÉANCES DE POINTAGE (quelques-unes récentes)
        # ============================================================
        superuser = User.objects.filter(is_superuser=True).first()
        pointages_count = 0
        statuts = ["PRESENT", "PRESENT", "PRESENT", "ABSENT", "REPORTE"]

        for edt in emplois[:40]:  # 40 premiers emplois
            for day_offset in range(0, 14, 7):  # 2 semaines
                d = date(2026, 6, max(1, 12 - day_offset))
                statut = random.choice(statuts)
                heures = 2.0 if statut == "PRESENT" else 0.0

                try:
                    SeancePointage.objects.create(
                        emploi_du_temps=edt,
                        date=d,
                        statut=statut,
                        heures_effectuees=heures,
                        motif="Cours normal" if statut == "PRESENT" else ("Maladie" if statut == "ABSENT" else "Report cause examen"),
                        valide_par=superuser,
                    )
                    pointages_count += 1
                except Exception:
                    pass  # Ignorer les doublons

        self.stdout.write(f"  ✅ {pointages_count} séances de pointage créées.")

        # ============================================================
        # 13. COMPTES UTILISATEURS (1 responsable par faculté)
        # ============================================================
        users_created = 0
        import re
        for f in facultes:
            raw_name = f.nom.lower().replace(" ", "_").replace("'", "")[:20]
            username = f"resp_{raw_name}"
            # Nettoyage du username
            username = re.sub(r'[^a-z0-9_]', '', username)[:30]

            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=f.email,
                    password="passer123",
                )
                UserProfile.objects.create(user=user, faculte=f)
                users_created += 1

        self.stdout.write(f"  👤 {users_created} comptes responsables créés (mot de passe: passer123).")

        # ============================================================
        # RÉSUMÉ FINAL
        # ============================================================
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS("🎉 DONNÉES D'ESSAI INSÉRÉES AVEC SUCCÈS !"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(f"  🏛️  Universités       : {Universite.objects.count()}")
        self.stdout.write(f"  📚 Facultés           : {Faculte.objects.count()}")
        self.stdout.write(f"  🏢 Départements       : {Departement.objects.count()}")
        self.stdout.write(f"  🚪 Salles             : {Salle.objects.count()}")
        self.stdout.write(f"  👨‍🏫 Enseignants        : {Enseignant.objects.count()}")
        self.stdout.write(f"  🎓 Classes            : {Classe.objects.count()}")
        self.stdout.write(f"  📖 Matières           : {Matiere.objects.count()}")
        self.stdout.write(f"  📅 Semestres          : {Semestre.objects.count()}")
        self.stdout.write(f"  🗓️  Années Académiques : {AnneeAcademique.objects.count()}")
        self.stdout.write(f"  📋 Enseignements      : {Enseignement.objects.count()}")
        self.stdout.write(f"  ⏰ Emplois du Temps   : {EmploiDuTemps.objects.count()}")
        self.stdout.write(f"  ✅ Pointages          : {SeancePointage.objects.count()}")
        self.stdout.write(f"  👤 Utilisateurs       : {User.objects.count()}")
        self.stdout.write(self.style.SUCCESS("=" * 60))
