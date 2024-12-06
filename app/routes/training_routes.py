from flask import Blueprint, render_template, request, jsonify


training_bp = Blueprint('training', __name__)

@training_bp.route('/analysis')
def analysis():
    return render_template('analysis.html')


