import os
import django
from django.core.management import call_command
from io import StringIO

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestens_backend.settings')
django.setup()

out = StringIO()
for i in range(1, 11):
    mig_name = f"{i:04d}"
    try:
        call_command('sqlmigrate', 'management', mig_name, stdout=out)
    except Exception:
        pass

with open('django_schema.sql', 'w', encoding='utf-8') as f:
    f.write(out.getvalue())
