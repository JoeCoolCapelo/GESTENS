BEGIN;
--
-- Create model AnneeAcademique
--
CREATE TABLE "management_anneeacademique" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(20) NOT NULL UNIQUE, "description" text NULL, "is_current" bool NOT NULL);
--
-- Create model Classe
--
CREATE TABLE "management_classe" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(100) NOT NULL, "niveau" varchar(50) NOT NULL);
--
-- Create model Departement
--
CREATE TABLE "management_departement" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(150) NOT NULL, "description" text NULL);
--
-- Create model Enseignant
--
CREATE TABLE "management_enseignant" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "prenom" varchar(100) NOT NULL, "nom" varchar(100) NOT NULL, "date_naissance" date NULL, "telephone" varchar(20) NULL, "email" varchar(100) NOT NULL UNIQUE, "specialite" varchar(150) NULL, "dernier_diplome" varchar(100) NULL, "grade_academique" varchar(100) NULL, "matricule" varchar(50) NOT NULL UNIQUE, "fonction" varchar(100) NULL, "type" varchar(20) NOT NULL, "departement_id" bigint NOT NULL REFERENCES "management_departement" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Faculte
--
CREATE TABLE "management_faculte" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(150) NOT NULL, "logo" varchar(100) NULL, "email" varchar(100) NOT NULL UNIQUE);
--
-- Create model Semestre
--
CREATE TABLE "management_semestre" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(5) NOT NULL UNIQUE, "type" varchar(10) NOT NULL);
--
-- Create model UserProfile
--
CREATE TABLE "management_userprofile" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "faculte_id" bigint NOT NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED, "user_id" integer NOT NULL UNIQUE REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Salle
--
CREATE TABLE "management_salle" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(100) NOT NULL, "capacite" integer unsigned NULL CHECK ("capacite" >= 0), "faculte_id" bigint NOT NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Matiere
--
CREATE TABLE "management_matiere" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(150) NOT NULL, "code" varchar(20) NOT NULL UNIQUE, "departement_id" bigint NOT NULL REFERENCES "management_departement" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model Enseignement
--
CREATE TABLE "management_enseignement" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "annee_academique_id" bigint NULL REFERENCES "management_anneeacademique" ("id") DEFERRABLE INITIALLY DEFERRED, "classe_id" bigint NOT NULL REFERENCES "management_classe" ("id") DEFERRABLE INITIALLY DEFERRED, "enseignant_id" bigint NOT NULL REFERENCES "management_enseignant" ("id") DEFERRABLE INITIALLY DEFERRED, "matiere_id" bigint NOT NULL REFERENCES "management_matiere" ("id") DEFERRABLE INITIALLY DEFERRED, "semestre_id" bigint NOT NULL REFERENCES "management_semestre" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Create model EmploiDuTemps
--
CREATE TABLE "management_emploidutemps" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "jour" varchar(15) NOT NULL, "heure_debut" time NOT NULL, "heure_fin" time NOT NULL, "enseignement_id" bigint NOT NULL REFERENCES "management_enseignement" ("id") DEFERRABLE INITIALLY DEFERRED, "salle_id" bigint NULL REFERENCES "management_salle" ("id") DEFERRABLE INITIALLY DEFERRED);
--
-- Add field faculte to departement
--
CREATE TABLE "new__management_departement" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(150) NOT NULL, "description" text NULL, "faculte_id" bigint NOT NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED);
INSERT INTO "new__management_departement" ("id", "nom", "description", "faculte_id") SELECT "id", "nom", "description", NULL FROM "management_departement";
DROP TABLE "management_departement";
ALTER TABLE "new__management_departement" RENAME TO "management_departement";
CREATE INDEX "management_enseignant_departement_id_a8c25f1e" ON "management_enseignant" ("departement_id");
CREATE INDEX "management_userprofile_faculte_id_ced14846" ON "management_userprofile" ("faculte_id");
CREATE INDEX "management_salle_faculte_id_ec71ec70" ON "management_salle" ("faculte_id");
CREATE INDEX "management_matiere_departement_id_d6ec67a0" ON "management_matiere" ("departement_id");
CREATE INDEX "management_enseignement_annee_academique_id_e7e82a60" ON "management_enseignement" ("annee_academique_id");
CREATE INDEX "management_enseignement_classe_id_1aab05a1" ON "management_enseignement" ("classe_id");
CREATE INDEX "management_enseignement_enseignant_id_603d9c49" ON "management_enseignement" ("enseignant_id");
CREATE INDEX "management_enseignement_matiere_id_965de028" ON "management_enseignement" ("matiere_id");
CREATE INDEX "management_enseignement_semestre_id_a1b21eb1" ON "management_enseignement" ("semestre_id");
CREATE INDEX "management_emploidutemps_enseignement_id_82d3a94e" ON "management_emploidutemps" ("enseignement_id");
CREATE INDEX "management_emploidutemps_salle_id_64956c5f" ON "management_emploidutemps" ("salle_id");
CREATE INDEX "management_departement_faculte_id_d87f13d4" ON "management_departement" ("faculte_id");
--
-- Add field departement to classe
--
CREATE TABLE "new__management_classe" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(100) NOT NULL, "niveau" varchar(50) NOT NULL, "departement_id" bigint NOT NULL REFERENCES "management_departement" ("id") DEFERRABLE INITIALLY DEFERRED);
INSERT INTO "new__management_classe" ("id", "nom", "niveau", "departement_id") SELECT "id", "nom", "niveau", NULL FROM "management_classe";
DROP TABLE "management_classe";
ALTER TABLE "new__management_classe" RENAME TO "management_classe";
CREATE INDEX "management_classe_departement_id_e2d02af3" ON "management_classe" ("departement_id");
COMMIT;
BEGIN;
--
-- Create model Universite
--
CREATE TABLE "management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL);
COMMIT;
BEGIN;
--
-- Add field bp to universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "bp" varchar(50) NOT NULL, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "bp") SELECT "id", "nom", "sigle", "slogan", "logo", 'BP: 1147 Conakry' FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Add field email_contact to universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL, "bp" varchar(50) NOT NULL, "email_contact" varchar(100) NOT NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "bp", "email_contact") SELECT "id", "nom", "sigle", "slogan", "logo", "bp", 'info@uganc.edu.gn' FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Add field republique to universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL, "bp" varchar(50) NOT NULL, "email_contact" varchar(100) NOT NULL, "republique" varchar(100) NOT NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "bp", "email_contact", "republique") SELECT "id", "nom", "sigle", "slogan", "logo", "bp", "email_contact", 'RÉPUBLIQUE DE GUINÉE' FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
COMMIT;
BEGIN;
--
-- Add field photo to enseignant
--
ALTER TABLE "management_enseignant" ADD COLUMN "photo" varchar(100) NULL;
COMMIT;
BEGIN;
--
-- Create model RecentActivity
--
CREATE TABLE "management_recentactivity" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "description" varchar(255) NOT NULL, "target_name" varchar(150) NULL, "action_type" varchar(20) NOT NULL, "timestamp" datetime NOT NULL, "faculte_id" bigint NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED, "user_id" integer NOT NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED);
CREATE INDEX "management_recentactivity_faculte_id_fd4a27b6" ON "management_recentactivity" ("faculte_id");
CREATE INDEX "management_recentactivity_user_id_4b274039" ON "management_recentactivity" ("user_id");
COMMIT;
BEGIN;
--
-- Add field photo to userprofile
--
ALTER TABLE "management_userprofile" ADD COLUMN "photo" varchar(100) NULL;
COMMIT;
BEGIN;
--
-- Add field is_archived to recentactivity
--
CREATE TABLE "new__management_recentactivity" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "is_archived" bool NOT NULL, "description" varchar(255) NOT NULL, "target_name" varchar(150) NULL, "action_type" varchar(20) NOT NULL, "timestamp" datetime NOT NULL, "faculte_id" bigint NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED, "user_id" integer NOT NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED);
INSERT INTO "new__management_recentactivity" ("id", "description", "target_name", "action_type", "timestamp", "faculte_id", "user_id", "is_archived") SELECT "id", "description", "target_name", "action_type", "timestamp", "faculte_id", "user_id", 0 FROM "management_recentactivity";
DROP TABLE "management_recentactivity";
ALTER TABLE "new__management_recentactivity" RENAME TO "management_recentactivity";
CREATE INDEX "management_recentactivity_faculte_id_fd4a27b6" ON "management_recentactivity" ("faculte_id");
CREATE INDEX "management_recentactivity_user_id_4b274039" ON "management_recentactivity" ("user_id");
COMMIT;
BEGIN;
--
-- Change Meta options on universite
--
-- (no-op)
--
-- Add field universite to faculte
--
ALTER TABLE "management_faculte" ADD COLUMN "universite_id" bigint NULL REFERENCES "management_universite" ("id") DEFERRABLE INITIALLY DEFERRED;
--
-- Alter field bp on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL, "email_contact" varchar(100) NOT NULL, "republique" varchar(100) NOT NULL, "bp" varchar(50) NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "email_contact", "republique", "bp") SELECT "id", "nom", "sigle", "slogan", "logo", "email_contact", "republique", "bp" FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
CREATE INDEX "management_faculte_universite_id_44ada323" ON "management_faculte" ("universite_id");
--
-- Alter field email_contact on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL, "bp" varchar(50) NULL, "republique" varchar(100) NOT NULL, "email_contact" varchar(100) NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "bp", "republique", "email_contact") SELECT "id", "nom", "sigle", "slogan", "logo", "bp", "republique", "email_contact" FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field nom on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "sigle" varchar(20) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL, "bp" varchar(50) NULL, "email_contact" varchar(100) NULL, "republique" varchar(100) NOT NULL, "nom" varchar(200) NOT NULL);
INSERT INTO "new__management_universite" ("id", "sigle", "slogan", "logo", "bp", "email_contact", "republique", "nom") SELECT "id", "sigle", "slogan", "logo", "bp", "email_contact", "republique", "nom" FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field republique on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL, "bp" varchar(50) NULL, "email_contact" varchar(100) NULL, "republique" varchar(100) NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "bp", "email_contact", "republique") SELECT "id", "nom", "sigle", "slogan", "logo", "bp", "email_contact", "republique" FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field sigle on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "slogan" varchar(200) NOT NULL, "logo" varchar(100) NULL, "bp" varchar(50) NULL, "email_contact" varchar(100) NULL, "republique" varchar(100) NULL, "sigle" varchar(20) NULL);
INSERT INTO "new__management_universite" ("id", "nom", "slogan", "logo", "bp", "email_contact", "republique", "sigle") SELECT "id", "nom", "slogan", "logo", "bp", "email_contact", "republique", "sigle" FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field slogan on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NULL, "logo" varchar(100) NULL, "bp" varchar(50) NULL, "email_contact" varchar(100) NULL, "republique" varchar(100) NULL, "slogan" varchar(200) NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "logo", "bp", "email_contact", "republique", "slogan") SELECT "id", "nom", "sigle", "logo", "bp", "email_contact", "republique", "slogan" FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
COMMIT;
BEGIN;
--
-- Change Meta options on universite
--
-- (no-op)
--
-- Alter field bp on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "bp" varchar(50) NOT NULL, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NULL, "slogan" varchar(200) NULL, "logo" varchar(100) NULL, "email_contact" varchar(100) NULL, "republique" varchar(100) NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "email_contact", "republique", "bp") SELECT "id", "nom", "sigle", "slogan", "logo", "email_contact", "republique", coalesce("bp", 'BP: 1147 Conakry') FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field email_contact on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NULL, "slogan" varchar(200) NULL, "logo" varchar(100) NULL, "bp" varchar(50) NOT NULL, "republique" varchar(100) NULL, "email_contact" varchar(100) NOT NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "bp", "republique", "email_contact") SELECT "id", "nom", "sigle", "slogan", "logo", "bp", "republique", coalesce("email_contact", 'info@uganc.edu.gn') FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field nom on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "sigle" varchar(20) NULL, "slogan" varchar(200) NULL, "logo" varchar(100) NULL, "bp" varchar(50) NOT NULL, "email_contact" varchar(100) NOT NULL, "republique" varchar(100) NULL, "nom" varchar(200) NOT NULL);
INSERT INTO "new__management_universite" ("id", "sigle", "slogan", "logo", "bp", "email_contact", "republique", "nom") SELECT "id", "sigle", "slogan", "logo", "bp", "email_contact", "republique", "nom" FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field republique on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NULL, "slogan" varchar(200) NULL, "logo" varchar(100) NULL, "bp" varchar(50) NOT NULL, "email_contact" varchar(100) NOT NULL, "republique" varchar(100) NOT NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "slogan", "logo", "bp", "email_contact", "republique") SELECT "id", "nom", "sigle", "slogan", "logo", "bp", "email_contact", coalesce("republique", 'RÉPUBLIQUE DE GUINÉE') FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field sigle on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "slogan" varchar(200) NULL, "logo" varchar(100) NULL, "bp" varchar(50) NOT NULL, "email_contact" varchar(100) NOT NULL, "republique" varchar(100) NOT NULL, "sigle" varchar(20) NOT NULL);
INSERT INTO "new__management_universite" ("id", "nom", "slogan", "logo", "bp", "email_contact", "republique", "sigle") SELECT "id", "nom", "slogan", "logo", "bp", "email_contact", "republique", coalesce("sigle", 'UGANC') FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
--
-- Alter field slogan on universite
--
CREATE TABLE "new__management_universite" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "nom" varchar(200) NOT NULL, "sigle" varchar(20) NOT NULL, "logo" varchar(100) NULL, "bp" varchar(50) NOT NULL, "email_contact" varchar(100) NOT NULL, "republique" varchar(100) NOT NULL, "slogan" varchar(200) NOT NULL);
INSERT INTO "new__management_universite" ("id", "nom", "sigle", "logo", "bp", "email_contact", "republique", "slogan") SELECT "id", "nom", "sigle", "logo", "bp", "email_contact", "republique", coalesce("slogan", 'Le temple du savoir') FROM "management_universite";
DROP TABLE "management_universite";
ALTER TABLE "new__management_universite" RENAME TO "management_universite";
COMMIT;
BEGIN;
--
-- Add field enseignant to userprofile
--
CREATE TABLE "new__management_userprofile" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "enseignant_id" bigint NULL UNIQUE REFERENCES "management_enseignant" ("id") DEFERRABLE INITIALLY DEFERRED, "faculte_id" bigint NOT NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED, "user_id" integer NOT NULL UNIQUE REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "photo" varchar(100) NULL);
INSERT INTO "new__management_userprofile" ("id", "faculte_id", "user_id", "photo", "enseignant_id") SELECT "id", "faculte_id", "user_id", "photo", NULL FROM "management_userprofile";
DROP TABLE "management_userprofile";
ALTER TABLE "new__management_userprofile" RENAME TO "management_userprofile";
CREATE INDEX "management_userprofile_faculte_id_ced14846" ON "management_userprofile" ("faculte_id");
--
-- Alter field jour on emploidutemps
--
CREATE TABLE "new__management_emploidutemps" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "heure_debut" time NOT NULL, "heure_fin" time NOT NULL, "enseignement_id" bigint NOT NULL REFERENCES "management_enseignement" ("id") DEFERRABLE INITIALLY DEFERRED, "salle_id" bigint NULL REFERENCES "management_salle" ("id") DEFERRABLE INITIALLY DEFERRED, "jour" varchar(20) NOT NULL);
INSERT INTO "new__management_emploidutemps" ("id", "heure_debut", "heure_fin", "enseignement_id", "salle_id", "jour") SELECT "id", "heure_debut", "heure_fin", "enseignement_id", "salle_id", "jour" FROM "management_emploidutemps";
DROP TABLE "management_emploidutemps";
ALTER TABLE "new__management_emploidutemps" RENAME TO "management_emploidutemps";
CREATE INDEX "management_emploidutemps_enseignement_id_82d3a94e" ON "management_emploidutemps" ("enseignement_id");
CREATE INDEX "management_emploidutemps_salle_id_64956c5f" ON "management_emploidutemps" ("salle_id");
--
-- Alter field salle on emploidutemps
--
-- (no-op)
--
-- Alter field photo on userprofile
--
CREATE TABLE "new__management_userprofile" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "faculte_id" bigint NOT NULL REFERENCES "management_faculte" ("id") DEFERRABLE INITIALLY DEFERRED, "user_id" integer NOT NULL UNIQUE REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "enseignant_id" bigint NULL UNIQUE REFERENCES "management_enseignant" ("id") DEFERRABLE INITIALLY DEFERRED, "photo" varchar(100) NULL);
INSERT INTO "new__management_userprofile" ("id", "faculte_id", "user_id", "enseignant_id", "photo") SELECT "id", "faculte_id", "user_id", "enseignant_id", "photo" FROM "management_userprofile";
DROP TABLE "management_userprofile";
ALTER TABLE "new__management_userprofile" RENAME TO "management_userprofile";
CREATE INDEX "management_userprofile_faculte_id_ced14846" ON "management_userprofile" ("faculte_id");
--
-- Alter unique_together for emploidutemps (1 constraint(s))
--
CREATE UNIQUE INDEX "management_emploidutemps_jour_heure_debut_heure_fin_salle_id_a4616bd1_uniq" ON "management_emploidutemps" ("jour", "heure_debut", "heure_fin", "salle_id");
--
-- Create model SeancePointage
--
CREATE TABLE "management_seancepointage" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "date" date NOT NULL, "statut" varchar(10) NOT NULL, "heures_effectuees" decimal NOT NULL, "motif" text NULL, "created_at" datetime NOT NULL, "emploi_du_temps_id" bigint NOT NULL REFERENCES "management_emploidutemps" ("id") DEFERRABLE INITIALLY DEFERRED, "valide_par_id" integer NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED);
CREATE UNIQUE INDEX "management_seancepointage_emploi_du_temps_id_date_9bf41e0e_uniq" ON "management_seancepointage" ("emploi_du_temps_id", "date");
CREATE INDEX "management_seancepointage_emploi_du_temps_id_19ad3c64" ON "management_seancepointage" ("emploi_du_temps_id");
CREATE INDEX "management_seancepointage_valide_par_id_e4411cb7" ON "management_seancepointage" ("valide_par_id");
COMMIT;
