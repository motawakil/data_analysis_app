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
    data_saved_path = os.path.join(current_app.static_folder, 'data_saved')
    files = [
        {'id': file, 'name': file}
        for file in os.listdir(data_saved_path)
        if file.endswith('.csv') and file != 'None.csv'
    ] if os.path.exists(data_saved_path) else []
    return jsonify(files)





@export_bp.route('/get-visualizations', methods=['GET'])
def get_visualizations():
    username = request.args.get('username')
    filename = request.args.get('fileName')
    
    print(f"Debug - Username: {username}, Filename: {filename}")
    try:
       
        # Fetch charts and statistics for the user and file
        #charts = Chart.query.filter_by(
            #user=username,
            #file_path=filename
        #).all()
        from sqlalchemy import and_, func

        charts = Chart.query.filter(
        and_(
        Chart.user == username,
        Chart.image_path.like(f"charts/{filename}%")  # Match files starting with 'filename'
        )
         ).all()
        
        #charts = Chart.query.filter_by(
           # user=username,
           # file_path=os.path.join(current_app.static_folder, 'charts', filename) # Full path
       # ).all()

        
        #charts = Chart.query.all()
        
        stats = Statistics.query.filter_by(
            user=username,
            file_path=filename
        ).all()
        
        print(f"Found {len(charts)} charts and {len(stats)} statistics")

        
        print("charts is : ",charts)
        print("statisctics  is : ",stats)


        return jsonify({
            'charts': [{
                'id': chart.id,
                'x_axis': chart.choix_X,
                'y_axis': chart.choix_Y,
                'type': chart.library,
                'image': f"/static/{chart.image_path}",
                #'image': f"/static/charts/{os.path.basename(chart.image_path)}",
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
        return jsonify({'error': str(e)}), 500
    


    

