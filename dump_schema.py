import sqlite3
conn = sqlite3.connect('db.sqlite3')
with open('full_schema.sql', 'w') as f:
    for row in conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name LIKE 'management_%'"):
        if row[0]:
            f.write(row[0] + ";\n\n")
