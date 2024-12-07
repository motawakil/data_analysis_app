from flask import Flask
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register blueprints
    from .routes.data_routes import data_bp
    from .routes.visualization_routes import visualization_bp
    from .routes.training_routes import training_bp
    from .routes.export_routes import export_bp

    app.register_blueprint(data_bp)
    app.register_blueprint(visualization_bp)
    app.register_blueprint(training_bp)
    app.register_blueprint(export_bp)

    return app