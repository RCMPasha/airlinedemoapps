import os, sqlite3

# Path relative to this script inside the container (working dir /app)
DB_PATH = os.path.join(os.path.dirname(__file__), 'meridianairways.db')
print('DB path:', DB_PATH)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Tables:', cur.fetchall())
cur.execute('SELECT COUNT(*) FROM bookings')
print('Bookings count:', cur.fetchone()[0])
