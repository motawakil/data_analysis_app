from flask import Blueprint, request, render_template, redirect, url_for, flash, session
from database.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash


auth_bp = Blueprint('auth', __name__)

# Signup Route
@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = generate_password_hash(request.form['password'])

        # Check if email or username already exists
        existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
        if existing_user:
            flash("L'email ou le nom d'utilisateur existe déjà.", "danger")
        else:
            new_user = User(username=username, email=email, password=password)
            db.session.add(new_user)
            db.session.commit()
            flash("Inscription réussie! Connectez-vous maintenant.", "success")
            return redirect(url_for('auth.login'))  # Correct URL for login

    return render_template('signup.html')


# Login Route
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            # Log in the user (use session or Flask-Login)
            flash("Connexion réussie!", "success")
            session['user_id'] = user.id  # Store user_id in session (if not using Flask-Login)
            session['username'] = user.username  # Store username in session (if needed)
            return redirect(url_for('main.home'))  # Correct URL for home page after login
        else:
            flash("Email ou mot de passe incorrect.", "danger")

    return render_template('login.html')


# Logout Route
@auth_bp.route('/logout')
def logout():
    session.pop('user_id', None)  # Clear session
    session.pop('username', None)
    flash("Vous êtes déconnecté avec succès.", "success")
    return redirect(url_for('main.home'))  # Correct URL for home page after logout
