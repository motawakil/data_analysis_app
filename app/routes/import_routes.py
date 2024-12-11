import os
from flask import Blueprint, request, jsonify
import pandas as pd

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

        # Process the file based on type (CSV, Excel, or JSON)
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file_path)
        else:
            return jsonify({'error': 'Format de fichier non supporté.'}), 400

        # Basic Information about the file
        file_info = {
            'file_size': file_size,
            'num_rows': len(df),
            'num_columns': len(df.columns),
            'columns': df.columns.tolist(),
            'data_types': df.dtypes.astype(str).tolist(),
            # we will send also informations about the data pre-processing like (values null , calsse imb ...)
        }

        # Optionally: You could process the data further, e.g., saving it to a database

        # Return the file info and first 5 rows for preview
        data_preview = {
            'columns': df.columns.tolist(),
            'rows': df.head(5).values.tolist()
        }

        return jsonify({
            'message': 'Données envoyées avec succès!',
            'file_info': file_info,
            'data_preview': data_preview
        }), 200

    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500
