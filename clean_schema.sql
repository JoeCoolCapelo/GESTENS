CREATE TABLE "management_enseignant" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "prenom" varchar(100) NOT NULL, "nom" varchar(100) NOT NULL, "date_naissance" date NULL, "telephone" varchar(20) NULL, "email" varchar(100) NOT NULL UNIQUE, "specialite" varchar(150) NULL, "dernier_diplome" varchar(100) NULL, "grade_academique" varchar(100) NULL, "matricule" varchar(50) NOT NULL UNIQUE, "fonction" varchar(100) NULL, "type" varchar(20) NOT NULL, "departement_id" bigint NOT NULL REFERENCES "management_departement" ("id") DEFERRABLE INITIALLY DEFERRED);

CREATE TABLE "management_semestre" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(5) NOT NULL UNIQUE, "type" varchar(10) NOT NULL);

CREATE TABLE "management_matiere" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(150) NOT NULL, "code" varchar(20) NOT NULL UNIQUE, "departement_id" bigint NOT NULL REFERENCES "management_departement" ("id") DEFERRABLE INITIALLY DEFERRED);

CREATE TABLE "management_enseignement" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "classe_id" bigint NOT NULL REFERENCES "management_classe" ("id") DEFERRABLE INITIALLY DEFERRED, "enseignant_id" bigint NOT NULL REFERENCES "management_enseignant" ("id") DEFERRABLE INITIALLY DEFERRED, "matiere_id" bigint NOT NULL REFERENCES "management_matiere" ("id") DEFERRABLE INITIALLY DEFERRED, "semestre_id" bigint NOT NULL REFERENCES "management_semestre" ("id") DEFERRABLE INITIALLY DEFERRED, "annee_academique_id" bigint NULL REFERENCES "management_anneeacademique" ("id") DEFERRABLE INITIALLY DEFERRED);

CREATE TABLE "management_emploidutemps" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "jour" varchar(15) NOT NULL, "heure_debut" time NOT NULL, "heure_fin" time NOT NULL, "enseignement_id" bigint NOT NULL REFERENCES "management_enseignement" ("id") DEFERRABLE INITIALLY DEFERRED, "salle_id" bigint NULL REFERENCES "management_salle" ("id") DEFERRABLE INITIALLY DEFERRED);

CREATE TABLE "management_departement" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(150) NOT NULL, "description" text NULL, "faculte_id" bigint NOT NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED);

CREATE INDEX "management_enseignant_departement_id_a8c25f1e" ON "management_enseignant" ("departement_id");

CREATE INDEX "management_matiere_departement_id_d6ec67a0" ON "management_matiere" ("departement_id");

CREATE INDEX "management_enseignement_classe_id_1aab05a1" ON "management_enseignement" ("classe_id");

CREATE INDEX "management_enseignement_enseignant_id_603d9c49" ON "management_enseignement" ("enseignant_id");

CREATE INDEX "management_enseignement_matiere_id_965de028" ON "management_enseignement" ("matiere_id");

CREATE INDEX "management_enseignement_semestre_id_a1b21eb1" ON "management_enseignement" ("semestre_id");

CREATE INDEX "management_emploidutemps_enseignement_id_82d3a94e" ON "management_emploidutemps" ("enseignement_id");

CREATE INDEX "management_departement_faculte_id_d87f13d4" ON "management_departement" ("faculte_id");

CREATE TABLE "management_classe" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(100) NOT NULL, "niveau" varchar(50) NOT NULL, "departement_id" bigint NOT NULL REFERENCES "management_departement" ("id") DEFERRABLE INITIALLY DEFERRED);

CREATE INDEX "management_classe_departement_id_e2d02af3" ON "management_classe" ("departement_id");

CREATE TABLE "management_faculte" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(150) NOT NULL, "email" varchar(100) NOT NULL UNIQUE, "manager_id" integer NULL UNIQUE REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "logo" varchar(100) NULL);

CREATE TABLE "management_anneeacademique" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(20) NOT NULL UNIQUE, "description" text NULL, "is_current" bool NOT NULL);

CREATE TABLE "management_salle" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(100) NOT NULL, "capacite" integer unsigned NULL CHECK ("capacite" >= 0), "faculte_id" bigint NOT NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED);

CREATE INDEX "management_salle_faculte_id_ec71ec70" ON "management_salle" ("faculte_id");

CREATE INDEX "management_emploidutemps_salle_id_64956c5f" ON "management_emploidutemps" ("salle_id");

CREATE INDEX "management_enseignement_annee_academique_id_e7e82a60" ON "management_enseignement" ("annee_academique_id");