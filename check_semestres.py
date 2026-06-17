import sqlite3, json

conn = sqlite3.connect('db2.sqlite3')
rows = conn.execute("SELECT id, nom, type FROM management_semestre").fetchall()
print("Semestres dans SQLite:")
for r in rows:
    print(f"  id={r[0]}, nom='{r[1]}' (len={len(r[1])}), type='{r[2]}'")
conn.close()
