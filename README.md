# 🎓 GESTENS - Le Grand Portail de Gestion Universitaire

Bienvenue sur le projet **GESTENS** (Gestion des Enseignements) ! 

Ce document est conçu pour être **compris par tout le monde**, même si vous n'avez jamais programmé de votre vie. Prenez un café, asseyez-vous confortablement, et laissez-nous vous présenter ce projet de A à Z.

---

## 📖 1. L'histoire : À quoi sert ce projet ?

Imaginez une très grande université avec des dizaines de bâtiments (les facultés), des centaines de salles de classe, et des milliers de professeurs. 
Habituellement, pour organiser les emplois du temps, savoir qui enseigne quoi, et compter combien d'heures un professeur a travaillé pour le payer, les secrétaires utilisent des montagnes de papier ou des fichiers Excel très compliqués. C'est long, on perd des feuilles, et il y a beaucoup d'erreurs.

**GESTENS est la solution magique à ce problème.**
C'est un site web qui permet de **tout ranger au même endroit** :
- Savoir quelles sont les facultés et les départements.
- Avoir la liste de tous les professeurs et des matières.
- Créer les emplois du temps automatiquement en évitant que deux professeurs se retrouvent dans la même salle au même moment.
- Permettre aux responsables de faire l'appel (le pointage) en un clic pour dire : "M. Diallo a bien fait ses 2 heures de cours aujourd'hui".
- Afficher de beaux graphiques pour voir si tout se passe bien.

---

## 🎭 2. Les Personnages de l'application (Les Rôles)

Tout le monde ne voit pas la même chose sur l'application. C'est le principe du "chacun chez soi" :

1. 👑 **Le Super Administrateur (Le Directeur Général)** : Il a les clés du château. Il voit toutes les universités, toutes les facultés, et tous les professeurs.
2. 👨‍💼 **Le Responsable de Faculté (Le Gardien d'un bâtiment)** : Si M. Bah est responsable de la Faculté des Sciences, **il ne verra que les professeurs et les classes des Sciences**. Le système lui cache tout le reste pour qu'il ne se mélange pas les pinceaux avec la Faculté de Médecine.
3. 👨‍🏫 **L'Enseignant (Le Professeur)** : Il vient juste pour voir son propre emploi du temps et savoir dans quelle salle il doit aller donner son cours.

---

## 🧠 3. Comment ça marche à l'intérieur ? (L'Architecture)

Le projet est coupé en deux grands morceaux qui discutent entre eux, un peu comme dans un restaurant :

### A. Le Frontend (La Salle à Manger)
C'est tout ce que l'utilisateur voit et touche sur son écran (les boutons, les couleurs, les menus). C'est la "vitrine". 
- **L'outil principal utilisé** : **React.js**. C'est une technologie inventée par Facebook qui permet de créer des sites web très rapides, où la page n'a pas besoin de clignoter ou de recharger à chaque fois qu'on clique sur un bouton.
- **Le style visuel** : On utilise un style appelé *Glassmorphism* (qui donne l'impression que les menus sont faits en verre dépoli translucide) pour que ce soit très moderne et agréable à regarder.

### B. Le Backend (La Cuisine et le Coffre-fort)
C'est le cerveau caché du système. Quand vous cliquez sur "Enregistrer un professeur" dans le Frontend, la commande est envoyée au Backend. 
- **L'outil principal utilisé** : **Python avec Django**. C'est un langage très puissant et très sûr.
- C'est le Backend qui vérifie : "Attends, est-ce que cette personne a le droit de faire ça ? Oui ? D'accord, je sauvegarde".
- **La Base de données (L'Armoire à archives)** : C'est là que tout est stocké pour toujours (les noms, les mots de passe, les horaires). On utilise **SQLite** (un petit fichier d'archives) pour créer le projet, et on utilisera **PostgreSQL** (une immense chambre forte) quand le site sera sur Internet.

---

## 🚀 4. Guide d'Installation pour les Débutants

Vous voulez lancer le projet sur votre propre ordinateur ? Suivez ces étapes à la lettre, ligne par ligne.

### Préparation : Ce qu'il faut installer sur votre PC avant de commencer
1. Téléchargez et installez **Python** (C'est le moteur pour le Backend).
2. Téléchargez et installez **Node.js** (C'est le moteur pour le Frontend).
3. Téléchargez et installez **Git** (Pour pouvoir télécharger le code).
4. Téléchargez un éditeur de texte comme **VS Code** (Pour lire le code).

### Étape 1 : Télécharger le projet
Ouvrez le terminal de votre ordinateur (l'écran noir) et tapez :
```bash
git clone https://github.com/votre-nom/gestens.git
cd gestens
```

### Étape 2 : Allumer le "Cerveau" (Le Backend)
Toujours dans le terminal, nous allons créer une "bulle" isolée pour que le projet n'interfère pas avec votre ordinateur.
```bash
# 1. Créer la bulle (environnement virtuel)
python -m venv venv

# 2. Entrer dans la bulle
venv\Scripts\activate   # (Si vous êtes sur Windows)
source venv/bin/activate  # (Si vous êtes sur Mac ou Linux)

# 3. Installer les ingrédients magiques (les paquets Python)
pip install -r requirements.txt

# 4. Construire les tiroirs de l'armoire à archives (Base de données)
python manage.py migrate

# 5. Remplir l'armoire avec des fausses données pour tester le projet (Facultés, Professeurs...)
python seed_uganc.py

# 6. Allumer le moteur du Backend !
python manage.py runserver
```
✅ Bravo ! Le cerveau fonctionne. Ne fermez pas cette fenêtre noire.

### Étape 3 : Allumer la "Vitrine" (Le Frontend)
Ouvrez une **nouvelle** fenêtre de terminal noire (gardez la première ouverte).
```bash
# 1. Aller dans le dossier du Frontend
cd frontend

# 2. Installer les ingrédients visuels (les paquets Node)
npm install

# 3. Allumer le moteur du Frontend !
npm run dev
```
✅ Bravo ! Le site est maintenant allumé. Allez sur votre navigateur Internet (Chrome, Safari) et tapez cette adresse : `http://localhost:5173/`

---

## 🔑 5. Comment se connecter pour tester ?

Puisque nous avons généré de fausses données (grâce au script de l'Étape 2.5), vous pouvez utiliser ces identifiants pour tester l'application. 
**Le mot de passe pour tout le monde est le même : `passer123`**

- Si vous voulez tout voir comme un chef suprême : **`admin`**
- Si vous voulez gérer uniquement la Faculté des Sciences : **`resp_uganc_fst`**
- Si vous voulez gérer uniquement la Faculté de Médecine : **`resp_uganc_fmg`**

---

## 📂 6. Comprendre les dossiers (La visite guidée de la maison)

Quand vous ouvrez le dossier du projet, il y a beaucoup de choses. Voici la carte au trésor :

```text
GESTENS/
├── ⚙️ gestens_backend/      C'est le cœur des réglages du Backend (mots de passe secrets, configuration).
│
├── 🧠 management/           C'est ici que toute l'intelligence du projet se trouve :
│   ├── models.py         Les moules : Ça dit "Un professeur a un nom, un prénom et une photo".
│   ├── views.py          Le cerveau : C'est ici qu'on dit "Si l'utilisateur demande la liste des profs, donne-lui ça".
│   └── urls.py           Le facteur : C'est lui qui distribue le courrier et redirige les requêtes.
│
├── 🎨 frontend/             Tout ce qui concerne l'affichage visuel (React) :
│   ├── src/              Le code source principal :
│   │   ├── components/   Les briques de lego (Un bouton, un menu sur le côté...). On les crée une fois et on les réutilise.
│   │   ├── pages/        Les écrans entiers (L'écran de connexion, l'écran du tableau de bord).
│   │   ├── services/     Le téléphone : Le code qui permet d'appeler le Backend pour lui demander des données.
│   │   └── index.css     Le pot de peinture : Toutes les couleurs, les polices d'écriture et le style Glassmorphism.
│   └── vite.config.js    Le moteur de la vitrine qui fait que le site s'affiche si vite.
│
├── 🤖 manage.py             La télécommande : Le fichier Python qui permet de tout lancer.
└── 📜 README.md             Le mode d'emploi que vous êtes en train de lire !
```

---

## 🛠️ 7. En cas de problème (FAQ)

**Q : Mon écran affiche un message d'erreur rouge "Network Error" !**
R : Vous avez probablement oublié d'allumer le "Cerveau" (Backend). Vérifiez que vous avez bien fait `python manage.py runserver` dans votre première fenêtre noire, et qu'elle est toujours ouverte.

**Q : Je me connecte, mais je ne vois aucun professeur dans la liste ?**
R : C'est normal si vous êtes connecté en tant que "Responsable" d'une faculté qui vient d'être créée et qui est vide. Connectez-vous en tant que `resp_uganc_fst` pour voir les professeurs de sciences que nous avons générés pour vous.

**Q : L'application est en blanc, je la veux en noir !**
R : Regardez tout en bas à gauche de la barre latérale sur le site. Il y a un petit bouton avec un soleil ou une lune. Cliquez dessus ! 🌔

---
*Créé avec passion pour révolutionner la gestion universitaire.*
