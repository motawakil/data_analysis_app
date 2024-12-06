from flask import Flask
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register blueprints
    from app.routes.data_routes import data_bp
    from app.routes.visualization_routes import visualization_bp
    from app.routes.training_routes import training_bp

    app.register_blueprint(data_bp)
    app.register_blueprint(visualization_bp)
    app.register_blueprint(training_bp)

    return app
