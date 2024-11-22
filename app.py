from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')  # Use environment variable in production
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///lyrics.db')

# Fix for PostgreSQL URL from Render
if app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace('postgres://', 'postgresql://', 1)

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    lyrics = db.relationship('Lyric', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Lyric(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.route('/')
@login_required
def index():
    lyrics = Lyric.query.filter_by(user_id=current_user.id).order_by(Lyric.created_at.desc()).all()
    return render_template('index.html', lyrics=lyrics)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username')).first()
        if user and user.check_password(request.form.get('password')):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered')
            return redirect(url_for('register'))
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/add_lyric', methods=['POST'])
@login_required
def add_lyric():
    data = request.json
    new_lyric = Lyric(
        title=data['title'], 
        content=data['content'],
        user_id=current_user.id
    )
    db.session.add(new_lyric)
    db.session.commit()
    return jsonify({'success': True, 'id': new_lyric.id})

@app.route('/update_lyric/<int:id>', methods=['PUT'])
@login_required
def update_lyric(id):
    lyric = Lyric.query.get_or_404(id)
    if lyric.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    data = request.json
    lyric.title = data['title']
    lyric.content = data['content']
    db.session.commit()
    return jsonify({'success': True})

@app.route('/delete_lyric/<int:id>', methods=['DELETE'])
@login_required
def delete_lyric(id):
    lyric = Lyric.query.get_or_404(id)
    if lyric.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    db.session.delete(lyric)
    db.session.commit()
    return jsonify({'success': True})

# Database initialization and migration
def init_db():
    with app.app_context():
        # Check if we need to add user_id column
        inspector = db.inspect(db.engine)
        has_user_id = 'user_id' in [col['name'] for col in inspector.get_columns('lyric')]
        
        if not has_user_id:
            # Drop all tables and recreate with new schema
            db.drop_all()
            db.create_all()
            print("Database schema updated successfully.")
        else:
            # Just create any missing tables
            db.create_all()
            print("Database schema is up to date.")

# Initialize database with new schema
init_db()

if __name__ == '__main__':
    app.run(debug=True)
