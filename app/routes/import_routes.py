import os
from flask import Blueprint, request, jsonify, send_file , current_app
import pandas as pd
from app.preprocessing.preprocess import preprocess_data
from datetime import datetime
from io import BytesIO
from fpdf import FPDF

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

        # Store the dataframe for later use
        current_dataset = df

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

        preprocessing_results = preprocess_data(df)  # Assume this function returns preprocessing details

        return jsonify({
            'message': 'Données envoyées avec succès!',
            'file_info': file_info,
            'preprocessing_results': preprocessing_results
        }), 200

    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500




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


@import_routes.route('/download_pdf', methods=['GET'])
def download_pdf():
    global current_dataset
    if current_dataset is None:
        return jsonify({'error': 'Aucune donnée disponible pour la génération du PDF.'}), 400

    try:
        # Initialize PDF
        pdf = FPDF()
        pdf.add_page()

        # Title of the document
        pdf.set_font("Arial", size=16, style='B')
        pdf.cell(200, 10, txt="Importation Results", ln=True, align='C')
        pdf.ln(10)

        # 1. File Information Table
        pdf.set_font("Arial", size=12, style='B')
        pdf.cell(200, 10, txt="File Information", ln=True)

        # File information rows
        file_info = current_dataset['file_info']
        file_info_data = [
            ("Taille du fichier", f"{file_info['file_size']} bytes"),
            ("Type de fichier", file_info['file_type']),
            ("Date d'importation", file_info['upload_date']),
            ("Nombre de lignes", file_info['num_rows']),
            ("Nombre de colonnes", file_info['num_columns']),
            ("Types de données", ', '.join(file_info['data_types']))
        ]
        
        # Add file information table
        add_table(pdf, ["Attribut", "Valeur"], file_info_data, [100, 90])
        pdf.ln(10)

        # 2. Preprocessing Results Table
        pdf.set_font("Arial", size=12, style='B')
        pdf.cell(200, 10, txt="Preprocessing Results", ln=True)

        # Prepare preprocessing data
        preprocessing_results = current_dataset['preprocessing_results']
        preprocessing_data = []
        for column in preprocessing_results['missing_values']['total_missing']:
            missing_values = preprocessing_results['missing_values']['total_missing'][column] or 0
            percent_missing = preprocessing_results['missing_values']['percent_missing'][column] or 0
            unique_values = preprocessing_results['unique_values'][column] or 0
            preprocessing_data.append([
                column, 
                str(missing_values), 
                f"{percent_missing:.2f}%", 
                str(unique_values)
            ])

        # Add preprocessing results table
        add_table(pdf, 
                 ["Nom de la Colonne", "Valeurs Manquantes", "% Manquantes", "Valeurs Uniques"],
                 preprocessing_data,
                 [50, 40, 40, 50])

        # Save PDF to BytesIO object
        pdf_output = BytesIO()
        pdf.output(pdf_output)
        pdf_output.seek(0)

        # Send PDF as a response
        return send_file(
            pdf_output,
            as_attachment=True,
            download_name="importation_results.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:
        return jsonify({'error': f'Erreur lors de la génération du PDF: {str(e)}'}), 500
    
    
    
    
@import_routes.route('/prepare_data', methods=['POST'])
def prepare_data():
    try:
        # Get modified data from request
        data = request.json['tableData']
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Create data_saved directory if it doesn't exist
        save_dir = os.path.join(current_app.static_folder, 'data_saved')
        #if not os.path.exists(save_dir):
         #   os.makedirs(save_dir)
        
        # Save current version
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        save_path = os.path.join(save_dir, f'prepared_data_{timestamp}.csv')
        df.to_csv(save_path, index=False)
        
        # Preprocess data
        preprocessing_results = preprocess_data(df)
        
        return jsonify({
            'message': 'Données préparées et sauvegardées avec succès!',
            'preprocessing_results': preprocessing_results,
            
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500