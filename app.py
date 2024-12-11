from flask import Flask, render_template
import os
from app.routes.import_routes import import_routes
from app.routes.export_routes import export_bp
from app.routes.training_routes import training_bp
from app.routes.visualization_routes import visualization_bp

app = Flask(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Routes for main pages (Main Routes)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/import')
def import_data():
    return render_template('import.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/visualization')
def visualization():
    return render_template('visualization.html')

@app.route('/export')
def export():
    return render_template('export.html')

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

@app.route('/about')
def about():
    return render_template('about.html')

# Register Blueprints
app.register_blueprint(import_routes, url_prefix='/import_routes')
app.register_blueprint(export_bp, url_prefix= '/export')
app.register_blueprint(training_bp, url_prefix='/training')
app.register_blueprint(visualization_bp, url_prefix='/visualization')


if __name__ == '__main__':
    app.run(debug=True)
