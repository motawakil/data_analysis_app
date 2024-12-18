# routes/main_routes.py
from flask import Blueprint, render_template
from utils.utils import login_required  # Import the custom login_required decorator

# Create the Blueprint for the main routes
main_bp = Blueprint('main', __name__)

# Define main routes here
@main_bp.route('/', endpoint='home')
def home():
    return render_template('home.html')

@main_bp.route('/about', endpoint='about')
def about():
    return render_template('about.html')

@main_bp.route('/documentation', endpoint='documentation')
def documentation():
    return render_template('documentation.html')


@main_bp.route('/analysis')
@login_required
def analysis():
    return render_template('analysis.html')

@main_bp.route('/import')
@login_required
def import_data():
    return render_template('import.html')

@main_bp.route('/visualization')
@login_required
def visualization():
    return render_template('visualization.html')

@main_bp.route('/export')
@login_required
def export():
    return render_template('export.html')
