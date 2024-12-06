from flask import Blueprint, request, jsonify, current_app
from app.preprocessing.preprocess import process_data
from werkzeug.utils import secure_filename
import os

data_bp = Blueprint('data', __name__)

# Route to handle file uploads
@data_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process the uploaded file
        result = process_data(filepath)
        return jsonify(result)
    
    return jsonify({'error': 'Invalid file type'}), 400
