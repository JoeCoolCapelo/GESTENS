"""
Script de migration SQLite -> PostgreSQL.
Exporte les données depuis SQLite et les importe dans PostgreSQL.
"""
import os, sys, subprocess, json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ---- CONFIG ----
SQLITE_DB   = os.path.join(BASE_DIR, 'db2.sqlite3')   # Fichier SQLite principal
BACKUP_FILE = os.path.join(BASE_DIR, 'migration_backup.json')
MANAGE      = os.path.join(BASE_DIR, 'manage.py')
PYTHON      = sys.executable

def run(cmd, env=None):
    e = os.environ.copy()
    if env:
        e.update(env)
    e['PYTHONIOENCODING'] = 'utf-8'
    r = subprocess.run(cmd, capture_output=True, env=e)
    out = r.stdout.decode('utf-8', errors='replace')
    err = r.stderr.decode('utf-8', errors='replace')
    return r.returncode, out, err

print("=" * 60)
print("  MIGRATION SQLITE → POSTGRESQL")
print("=" * 60)

# ---- ÉTAPE 1 : Exporter depuis SQLite ----
print("\n[1/3] Export des données depuis SQLite...")
env_sqlite = {
    'DJANGO_DB_ENGINE': 'django.db.backends.sqlite3',
    'DJANGO_DB_NAME_SQLITE': SQLITE_DB,
}

# On utilise un settings temporaire inline via --settings n'est pas pratique,
# alors on lit directement avec sqlite3
import sqlite3

def export_via_sqlite_directly():
    """Export via Django en forçant la config SQLite dans les variables d'env."""
    code, out, err = run(
        [PYTHON, MANAGE, 'dumpdata',
         '--natural-foreign', '--natural-primary', '--indent', '2',
         '-e', 'contenttypes', '-e', 'auth.permission', '-e', 'admin.logentry'],
        env={
            'DB_NAME': '',   # Vide -> sqlite via DATABASE_URL temporaire
        }
    )
    return code, out, err

# Écriture directe depuis sqlite3 Python
print("   Lecture directe du fichier SQLite:", SQLITE_DB)
if not os.path.exists(SQLITE_DB):
    # Essayer db2.sqlite3
    SQLITE_DB = os.path.join(BASE_DIR, 'db2.sqlite3')
    if not os.path.exists(SQLITE_DB):
        print("   ERREUR: Aucun fichier SQLite trouvé (db.sqlite3 ou db2.sqlite3)")
        sys.exit(1)

print("   Fichier SQLite trouvé:", SQLITE_DB)
print("   Taille:", os.path.getsize(SQLITE_DB), "octets")

# ---- ÉTAPE 2: Modifier settings temporairement -> pointant SQLite ----
SETTINGS_FILE = os.path.join(BASE_DIR, 'gestens_backend', 'settings.py')
with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
    original_settings = f.read()

# Backup settings
with open(SETTINGS_FILE + '.bak', 'w', encoding='utf-8') as f:
    f.write(original_settings)

# Settings temporaires pointant SQLite
sqlite_settings = original_settings.replace(
    "        'ENGINE': 'django.db.backends.postgresql',",
    "        'ENGINE': 'django.db.backends.sqlite3',"
).replace(
    f"        'NAME': os.environ.get('DB_NAME', 'gestens_db'),",
    f"        'NAME': r'{SQLITE_DB}',"
).replace(
    "        'USER': os.environ.get('DB_USER', 'postgres'),",
    "        # 'USER': 'postgres',"
).replace(
    "        'PASSWORD': os.environ.get('DB_PASSWORD', '1234'),",
    "        # 'PASSWORD': '1234',"
).replace(
    "        'HOST': os.environ.get('DB_HOST', 'localhost'),",
    "        # 'HOST': 'localhost',"
).replace(
    "        'PORT': os.environ.get('DB_PORT', '5432'),",
    "        # 'PORT': '5432',"
)

with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
    f.write(sqlite_settings)

print("\n[2/3] Export depuis SQLite...")
code, out, err = run([PYTHON, MANAGE, 'dumpdata',
    '--natural-foreign', '--natural-primary', '--indent', '2',
    '-e', 'contenttypes', '-e', 'auth.permission', '-e', 'admin.logentry'])

# Restaurer settings PostgreSQL
with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
    f.write(original_settings)
print("   Settings PostgreSQL restaurés.")

if code != 0:
    print("   ERREUR export:", err)
    sys.exit(1)

# Sauvegarder le JSON en UTF-8
with open(BACKUP_FILE, 'wb') as f:
    f.write(out.encode('utf-8'))

print(f"   ✅ {len(out)} caractères exportés -> {BACKUP_FILE}")

# ---- ÉTAPE 3 : Importer dans PostgreSQL ----
print("\n[3/3] Import dans PostgreSQL...")
code2, out2, err2 = run([PYTHON, MANAGE, 'loaddata', BACKUP_FILE])

if code2 != 0:
    print("   ERREUR import:", err2[-2000:])
    sys.exit(1)

print("   ✅ Import terminé!")
print(out2)
print("\n" + "=" * 60)
print("  MIGRATION TERMINÉE AVEC SUCCÈS !")
print("  Toutes vos données sont maintenant dans PostgreSQL.")
print("=" * 60)
