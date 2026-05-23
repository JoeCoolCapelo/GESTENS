# Cahier des Charges Fonctionnel et Technique - Projet GESTENS

## 1. Présentation du Projet

### 1.1 Contexte
Le projet **GESTENS** (Gestion des Enseignants et des Statistiques) est une initiative de modernisation numérique pour l'**Université Gamal Abdel Nasser de Conakry (UGANC)**. Actuellement, la gestion des enseignants, des maquettes de cours et des emplois du temps est souvent fragmentée et manuelle au sein des différentes facultés.

### 1.2 Objectif Général
Développer une plateforme web intégrée, sécurisée et multi-facultés pour centraliser et automatiser la gestion académique et administrative de l'université.

---

## 2. Analyse des Besoins

### 2.1 Problématique
- Difficulté de suivi des enseignants (vacataires vs permanents).
- Conflits d'horaires et de salles fréquents.
- Absence d'un historique centralisé des activités administratives.
- Besoin d'isolation des données par faculté tout en gardant une supervision globale.

### 2.2 Utilisateurs et Rôles
| Rôle | Description |
| :--- | :--- |
| **Administrateur Central** | Gère l'infrastructure globale, les facultés, et les accès de haut niveau. |
| **Directeur de Faculté** | Responsable de la gestion des départements, enseignants et emplois du temps de sa propre faculté. |


---

## 3. Spécifications Fonctionnelles

### 3.1 Module Authentification et Sécurité
- **Connexion sécurisée** : Authentification via JWT (JSON Web Token).
- **Multi-tenancy** : Chaque utilisateur est rattaché à une faculté. Les données affichées et modifiables sont filtrées par cette appartenance.
- **Profil Utilisateur** : Gestion des informations personnelles et photos de profil.

### 3.2 Module Gestion des Structures
- **Facultés & Université** : Configuration des informations institutionnelles (logos, slogans, contacts).
- **Départements** : Création et gestion des départements au sein d'une faculté.
- **Salles** : Inventaire des salles de classe avec leur capacité d'accueil.

### 3.3 Module Gestion du Personnel (RH)
- **Fiches Enseignants** : Matricule, grade, spécialité, type (National/Étranger), et coordonnées.
- **Exportation** : Possibilité d'imprimer la liste des enseignants par département.

### 3.4 Module Pédagogique
- **Matières** : Gestion du catalogue de cours avec codes uniques.
- **Classes** : Gestion des niveaux (L1, L2, etc.) et des groupes d'étudiants.
- **Enseignements** : Association Enseignant + Matière + Classe pour un semestre et une année académique donnés.

### 3.5 Module Planification (Emploi du Temps)
- **Grille Horaire** : Création d'emplois du temps hebdomadaires.
- **Gestion des conflits** : Alerte automatique si une salle ou un enseignant est occupé sur le même créneau.
- **Impression Professionnelle** : Génération de documents PDF/Web optimisés pour l'affichage physique (format 8H-18H).

### 3.6 Module Audit et Monitoring
- **Activités Récentes** : Journalisation de toutes les actions (création, modification, suppression).
- **Archivage** : Système permettant aux super-administrateurs de mettre de côté d'anciennes activités sans les supprimer définitivement.

---

## 4. Spécifications Techniques

### 4.1 Stack Technologique
- **Backend** : Django 5.x (Python) avec Django REST Framework.
- **Frontend** : React 18+ (avec Vite.js).
- **Base de Données** : PostgreSQL (Production) / SQLite (Développement).
- **Styles** : CSS Vanilla / Framer Motion pour les animations.
- **Icônes** : Lucide-React.

### 4.2 Architecture
- **API REST** : Communication déconnectée entre le front et le back.
- **Storage** : Gestion des médias (images/logos) via le système de fichiers Django.
- **Isolation** : Utilisation de clés étrangères `faculte_id` sur toutes les entités majeures pour garantir le cloisonnement des données.

---

## 5. Spécifications IHM et Design

### 5.1 Charte Graphique
- **Esthétique Premium** : Utilisation de gradients subtils, de "Glassmorphism" et d'ombres douces.
- **Typographie** : Utilisation de polices modernes (type Inter ou Roboto).
- **Theme Switcher** : Support complet des modes Sombre (Dark) et Clair (Light).

### 5.2 Expérience Utilisateur (UX)
- **Responsive Design** : Interface adaptée aux tablettes et ordinateurs.
- **Micro-animations** : Transitions fluides lors de l'ouverture de modales ou du changement de page.
- **Feedback** : Notifications Toasts pour confirmer les actions de l'utilisateur.

---

## 6. Contraintes et Exigences

- **Performance** : Temps de réponse aux API < 200ms pour les requêtes simples.
- **Robustesse** : Gestion des erreurs côté client (écrans 404, erreurs serveur).
- **Disponibilité** : Architecture prévue pour un déploiement cloud (Heroku, DigitalOcean ou VPS local).

---

## 7. Plan de Livraison (Roadmap)

1. **Phase 1 : Fondations** (Setup Django/React, Auth, CRUD de base). - *Terminé*
2. **Phase 2 : Gestion Académique** (Enseignants, Matières, Classes). - *Terminé*
3. **Phase 3 : Planification** (Emploi du temps et Impression). - *En cours*
4. **Phase 4 : Optimisation & Audit** (Archivage, Logs avancés). - *En cours*
5. **Phase 5 : Déploiement et Formation**. - *À venir*
