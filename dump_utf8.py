import subprocess
import sys
import os

# Force UTF-8
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Run dumpdata and capture output as bytes
result = subprocess.run(
    [sys.executable, 'manage.py', 'dumpdata',
     '--natural-foreign', '--natural-primary', '--indent', '2',
     '-e', 'contenttypes', '-e', 'auth.permission', '-e', 'admin.logentry'],
    capture_output=True
)

# Write in UTF-8 explicitly
with open('backup_gestens_utf8.json', 'wb') as f:
    f.write(result.stdout)

print("Done. Bytes written:", len(result.stdout))
if result.stderr:
    print("Stderr:", result.stderr.decode('utf-8', errors='replace'))
