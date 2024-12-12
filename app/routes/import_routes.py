import os
from flask import Blueprint, request, jsonify
import pandas as pd
from app.preprocessing.preprocess import preprocess_data
from datetime import datetime

import_routes = Blueprint('import_routes', __name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@import_routes.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Get the file from the request
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'Aucun fichier n\'a été fourni.'}), 400

        # Save the file to the uploads folder
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Get file size in bytes
        file_size = os.path.getsize(file_path)

        # Detect file type based on extension
        if file.filename.endswith('.csv'):
            file_type = 'CSV'
            df = pd.read_csv(file_path)
        elif file.filename.endswith(('.xlsx', '.xls')):
            file_type = 'Excel'
            df = pd.read_excel(file_path)
        elif file.filename.endswith('.json'):
            file_type = 'JSON'
            df = pd.read_json(file_path)
        else:
            return jsonify({'error': 'Format de fichier non supporté.'}), 400

        # Get current date and time for upload timestamp
        upload_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Get file information
        file_info = {
            'file_size': file_size,
            'file_type': file_type,
            'upload_date': upload_date,
            'num_rows': len(df),
            'num_columns': len(df.columns),
            'data_types': df.dtypes.astype(str).tolist()
        }

        preprocessing_results = preprocess_data(df)  # a return of all preprocessing methods

        return jsonify({
            'message': 'Données envoyées avec succès!',
            'file_info': file_info,
            'preprocessing_results': preprocessing_results
        }), 200

    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500
