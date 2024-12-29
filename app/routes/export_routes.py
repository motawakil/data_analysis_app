"""Routes for data export functionality."""
from flask import Blueprint, request, jsonify, render_template , current_app , session , redirect, url_for
import os
from database.models import Chart, Statistics, User
from datetime import datetime

# Create Blueprint
export_bp = Blueprint('export', __name__)


# Route to fetch the list of available files (GET)
@export_bp.route('/get-files', methods=['GET'])
def get_files():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Username required'}), 400
    data_saved_path = os.path.join(current_app.static_folder, 'data_saved')
    
    files = []
    
    if os.path.exists(data_saved_path):
        for file in os.listdir(data_saved_path):
            if file.endswith('.csv') and file.startswith(f"{username}_") and file !='None_None.csv':
                display_name = file.replace(f"{username}_", "")  # Remove username prefix
                files.append({
                    'id': file,
                    'name': display_name
                })
    
    return jsonify(files)







@export_bp.route('/get-visualizations', methods=['GET'])
def get_visualizations():
    username = request.args.get('username')
    file_id = request.args.get('fileName')
    
    print(f"Debug - Username: {username}, File ID: {file_id}")
    
    try:
        # Get file path from Files model first
        file_path = os.path.join(current_app.static_folder, 'data_saved', file_id)
        
        # Query charts with proper filters
        charts = Chart.query.filter_by(
            user=username,
            file_path=file_path
        ).all()
        
        # Query statistics with same filters
        stats = Statistics.query.filter_by(
            user=username,
            file_path=file_id  # Note: Statistics uses filename, not full path
        ).all()
        
        print(f"Found {len(charts)} charts and {len(stats)} statistics")

        return jsonify({
            'charts': [{
                'id': chart.id,
                'x_axis': chart.choix_X,
                'y_axis': chart.choix_Y,
                'type': chart.library,
                'image': f"/static/{chart.image_path}",
                'date': chart.date.strftime('%Y-%m-%d %H:%M')
            } for chart in charts],
            'statistics': [{
                'id': stat.id,
                'column': stat.column,
                'mean': stat.mean,
                'median': stat.median,
                'variance': stat.variance,
                'quartiles': stat.quartiles
            } for stat in stats]
        })
    except Exception as e:
        print(f"Error in get_visualizations: {str(e)}")
        return jsonify({'error': str(e)}), 500
    


    