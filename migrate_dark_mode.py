from app import app, db, User
from sqlalchemy import text

def migrate_dark_mode():
    with app.app_context():
        # Add dark_mode column if it doesn't exist
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('user')]
        
        if 'dark_mode' not in columns:
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE user ADD COLUMN dark_mode BOOLEAN DEFAULT FALSE'))
                conn.commit()
            print("Added dark_mode column to user table")

if __name__ == '__main__':
    migrate_dark_mode()
