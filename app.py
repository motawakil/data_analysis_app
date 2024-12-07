from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json'}

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes for pages
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

    
if __name__ == '__main__':
    app.run(debug=True)