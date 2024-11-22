import os
import sqlite3
from app import db, app

# Remove the existing database
db_path = 'instance/lyrics.db'
if os.path.exists(db_path):
    os.remove(db_path)
    print("Old database removed.")

# Create new database with updated schema
with app.app_context():
    db.create_all()
    print("New database created with updated schema.")
