"""Routes for data export functionality."""
from flask import Blueprint, request, jsonify, send_file
from ..database.models import Dataset, Analysis
from ..export.export_utils import export_to_csv, export_to_excel, export_to_json
from ..database.db import db

export_bp = Blueprint('export', __name__)

@export_bp.route('/export/dataset/<int:dataset_id>', methods=['POST'])
def export_dataset(dataset_id):
    """Export a dataset in the specified format."""
    try:
        format_type = request.json.get('format', 'csv')
        dataset = Dataset.query.get_or_404(dataset_id)
        
        # Load the dataset (assuming it's stored as a file path)
        df = pd.read_csv(dataset.file_path)  # Adjust based on your file storage method
        
        export_functions = {
            'csv': export_to_csv,
            'excel': export_to_excel,
            'json': export_to_json
        }
        
        if format_type not in export_functions:
            return jsonify({'error': 'Unsupported export format'}), 400
        
        export_path = export_functions[format_type](df, f"dataset_{dataset_id}")
        
        return send_file(export_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@export_bp.route('/export/analysis/<int:analysis_id>', methods=['POST'])
def export_analysis(analysis_id):
    """Export analysis results in the specified format."""
    try:
        format_type = request.json.get('format', 'json')
        analysis = Analysis.query.get_or_404(analysis_id)
        
        export_functions = {
            'csv': export_to_csv,
            'excel': export_to_excel,
            'json': export_to_json
        }
        
        if format_type not in export_functions:
            return jsonify({'error': 'Unsupported export format'}), 400
        
        export_path = export_functions[format_type](analysis.results, f"analysis_{analysis_id}")
        
        return send_file(export_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
