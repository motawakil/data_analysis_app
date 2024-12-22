import os
from flask import Blueprint, request, jsonify, send_file,current_app
import pandas as pd
from app.preprocessing.preprocess import preprocess_data
from datetime import datetime
from io import BytesIO
from fpdf import FPDF



import openpyxl

import_routes = Blueprint('import_routes', __name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Global variable to store the current dataset (can be modified if multiple users are involved)
current_dataset = None


@import_routes.route('/upload', methods=['POST'])
def upload_file():
    global current_dataset
    try:
        # Get the file from the request
        print("Starting file upload...")
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'Aucun fichier n\'a été fourni.'}), 400
        
        
        print(f"Processing file: {file.filename}") # Debug log
        # Save the file to the uploads folder
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Get file size in bytes
        file_size = os.path.getsize(file_path)
        
    
        # Detect file type based on extension
        if file.filename.endswith('.csv'):
                df = pd.read_csv(file_path)
        elif file.filename.endswith('.xlsx'):
                df = pd.read_excel(file_path, engine='openpyxl')
        elif file.filename.endswith('.json'):
                df = pd.read_json(file_path)
        else:
            return jsonify({'error': 'Format de fichier non supporté.'}), 400

        # Store the dataframe for later use
        current_dataset = df

        # Get current date and time for upload timestamp
        upload_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Get file information
        file_info = {
            'file_size': file_size,
            'file_type': file.filename.split('.')[-1].upper(),
            'upload_date': upload_date,
            'num_rows': len(df),
            'num_columns': len(df.columns),
            'data_types': df.dtypes.astype(str).tolist()
        }

        preprocessing_results = preprocess_data(df)  # Assume this function returns preprocessing details

        return jsonify({
            'message': 'Données envoyées avec succès!',
            'file_info': file_info,
            'preprocessing_results': preprocessing_results,
        }), 200

    except Exception as e:
        print(f"Excel upload error: {str(e)}")  # Log the error
        return jsonify({'error': 'Erreur lors du chargement du fichier Excel.'}), 500



# Helper function to add a table to the PDF
def add_table(pdf, headers, data, col_widths, row_height=10):
    # Add header row
    pdf.set_font("Arial", 'B', 10)
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], row_height, header, border=1, align='C')
    pdf.ln()

    # Add data rows
    pdf.set_font("Arial", '', 10)
    for row in data:
        for i, cell in enumerate(row):
            pdf.cell(col_widths[i], row_height, str(cell), border=1, align='C')
        pdf.ln()
        
        
        
# Route to download the entire page (dataset preview + plot) as a PDF



    
    
    

@import_routes.route('/prepare_data', methods=['POST'])
def prepare_data():
    try:
        # Debug print
        print("Received request data:", request.json)
        
        if not request.json or 'tableData' not in request.json:
            return jsonify({'error': 'Données manquantes'}), 400
            
        data = request.json['tableData']
        filename = request.json.get('filename')
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        if df.empty:
            return jsonify({'error': 'Données vides'}), 400
        
        # Create data_saved directory 
        save_dir = os.path.join(current_app.static_folder,'data_saved')
    
        
        
        # Save with custom filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        save_path = os.path.join(save_dir, f'{filename}.csv')
        df.to_csv(save_path, index=False)
        
        # Preprocess data
        preprocessing_results = preprocess_data(df)
        
        return jsonify({
            'message': f'<h1 style="font-size: 24px; color: #000000; font-weight: bold;">Données sauvegardées sous le nom: {filename}.csv</h1>',
            'preprocessing_results': preprocessing_results,
            'saved_path': save_path
        }), 200
        
    except Exception as e:
        print("Error in prepare_data:", str(e))  # Debug print
        return jsonify({'error': str(e)}), 500