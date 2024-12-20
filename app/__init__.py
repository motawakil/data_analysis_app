from flask import Flask
from flask_migrate import Migrate
from database.models import db  # Assuming this is where your db is defined
from config import Config  # Config file for settings

def create_app():
    # Create the Flask app
    app = Flask(__name__)

    # Load configurations from the Config class
    app.config.from_object(Config)

    # Initialize the database with the app
    db.init_app(app)
    
 

    # Initialize Flask-Migrate for database migrations
    migrate = Migrate(app, db)

    # Register blueprints for routes
    from .routes.import_routes import import_routes
    from .routes.visualization_routes import visualization_bp
    from .routes.training_routes import training_bp
    from .routes.export_routes import export_bp
    from .routes.auth_routes import auth_bp
    from .routes.main_routes import main_bp  # Import main routes blueprint

    # Register the blueprints
    app.register_blueprint(main_bp)  # Register the main blueprint (no prefix)
    app.register_blueprint(import_routes, url_prefix='/import_routes')
    app.register_blueprint(visualization_bp, url_prefix='/visualization')
    app.register_blueprint(training_bp, url_prefix='/training')
    app.register_blueprint(export_bp, url_prefix='/export')
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app





