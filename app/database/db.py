"""Database configuration module."""
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app."""
    db.init_app(app)
    
    # Create all tables
    with app.app_context():
        db.create_all()
