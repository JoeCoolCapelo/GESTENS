import sqlite3
with sqlite3.connect('db.sqlite3') as conn:
    schema = []
    for row in conn.execute("SELECT sql FROM sqlite_master WHERE name LIKE 'management_%'"):
        if row[0]:
            schema.append(row[0] + ';')
    
    with open('clean_schema.sql', 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(schema))
