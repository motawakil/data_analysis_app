import os
import csv
from flask import Blueprint, current_app, jsonify, request
from app.visualization.matplotlib_charts import *
from app.visualization.seaborn_charts import *
import matplotlib.pyplot as plt
from database.models import db, Statistics , User , Chart  # Importing db and the Statistics model
import pandas as pd
from scipy.stats import skew, kurtosis

# Create a Blueprint
visualization_bp = Blueprint('visualization', __name__)

# Route to fetch the list of available files (GET)
# Route to fetch the list of available files (GET)
@visualization_bp.route('/get-files', methods=['GET'])
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
# Route to fetch the columns of a specific CSV file (GET)
@visualization_bp.route('/get-columns', methods=['GET'])
def get_columns():
    filename = request.args.get('filename')
    if not filename:
        return jsonify({'status': 'error', 'message': 'No file specified'}), 400

    file_path = os.path.join(current_app.static_folder, 'data_saved', filename)
    

    if not os.path.exists(file_path):
        return jsonify({'status': 'error', 'message': f'File {filename} not found'}), 404

    with open(file_path, mode='r', newline='', encoding='utf-8') as file:
        columns = csv.DictReader(file).fieldnames
        print("columns" , columns)
    return jsonify({'status': 'success', 'columns': columns})



# Route to fetch available chart options based on selected X and Y axes (GET)
@visualization_bp.route('/get-chart-options', methods=['GET'])
def get_chart_options():
    x_axis = request.args.get('x_axis')
    y_axis = request.args.get('y_axis')
    print("y_axis" , y_axis)
    # Check if X and Y columns are provided
    if not x_axis:
        return jsonify({'status': 'error', 'message': 'X-axis is required'}), 400

    # Determine the data type of the X and Y axes (for simplicity, we'll assume numeric or categorical)
    # In real case, you would cheSck the column's data type based on the CSV content
    # For now, we simulate the check by assuming a certain condition:
    x_is_numeric = is_column_numeric(x_axis)
    y_is_numeric = is_column_numeric(y_axis) if y_axis else None

    # Determine the best chart types based on X and Y axes data types
    chart_types = []
# Détermine les types de graphiques en fonction des types de données des axes X et Y


    if x_is_numeric:
        if y_is_numeric:
            # Les deux axes sont numériques
            chart_types = ['scatter', 'line', 'heatmap']  # Nuage de points, courbe, et carte de chaleur
        elif y_axis == "" or y_axis is None:
            # X est numérique mais Y est manquant
            chart_types = ['histogram', 'kde']  # Histogramme et estimation de densité
        else :            
    # Ajout du swarm_plot pour X numérique et Y catégoriel
            chart_types = ['swarm_plot'] 

    elif not x_is_numeric:
        if y_is_numeric:
            # X est catégoriel et Y est numérique
            chart_types = ['bar', 'box', 'violin']  # Diagramme en barres, boîte à moustaches, et violon
        elif y_axis == "" or y_axis is None:
            # X est catégoriel sans Y
            chart_types = ['pie']  # Camembert et décompte des catégories
        else:
            # Les deux axes sont catégorielles
            chart_types = ['heatmap']  # Carte de chaleur pour les relations catégorielles croisées

    # Affichage des types de graphiques possibles
    print("Types de graphiques recommandés :", chart_types)



    return jsonify({'status': 'success', 'chart_types': chart_types})


def is_column_numeric(column_name):
    # This is a dummy check. Replace this with logic to check the column data type in the actual file.
    # For simplicity, let's assume columns with numbers in their name are numeric.
    return column_name.lower() in ['age', 'income', 'value', 'quantity']  # Example numeric columns


# Helper function to map chart types to functions
def get_chart_function(library, chart_type):
    prefix = 'mpl_' if library == 'matplotlib' else 'sns_'
    function_name = f"{prefix}{chart_type}_chart"
    try:
        return globals()[function_name]
    except KeyError:
        raise ValueError(f"Unsupported chart type: {chart_type} for library: {library}")


@visualization_bp.route('/create-visualization', methods=['POST'])
def create_visualization_route():
    from datetime import datetime
    
    data = request.json

    # Extract parameters
    file_name = data.get('file_name')
    chart_type = data.get('chart_type')
    x_axis = data.get('x_axis')
    y_axis = data.get('y_axis')
    filter = data.get('filter')
    library = data.get('library')
    username = data.get('username')

    print("filter:", filter)

    # Validate required parameters
    if not file_name or not chart_type:
        return jsonify({'status': 'error', 'message': 'File name and chart type are required.'}), 400
    if not x_axis and chart_type not in ['heatmap', 'pie']:  # Some charts don't need x_axis
        return jsonify({'status': 'error', 'message': 'X-axis is required for this chart type.'}), 400

    # Verify file existence
    file_path = os.path.join(current_app.static_folder, 'data_saved', file_name)
    if not os.path.exists(file_path):
        return jsonify({'status': 'error', 'message': f'File {file_name} not found.'}), 404

    try:
        # Get the chart function
        chart_function = get_chart_function(library, chart_type)
        print(chart_function)

        # Prepare arguments dynamically based on chart requirements
        chart_args = {'file_path': file_path}
        if x_axis:
            chart_args['x_axis'] = x_axis
        if y_axis:
            chart_args['y_axis'] = y_axis
        if filter is None:
            filter = {}

        if filter:
            filter_type = filter.get('type', '').replace('<', 'under').replace('>', 'over')
            filter_value = filter.get('value', '')
            chart_args['filter'] = filter
        else:
            filter_type = ''
            filter_value = ''

        # Generate the chart
        print(chart_args)
        output_fig = chart_function(**chart_args)
        
        # Modify the output path based on the presence of the filter
        if filter:
            output_path = os.path.join(
                'charts',
                f'{file_name.split(".")[0]}_{chart_type}_{library}_{filter_type}_{filter_value}_chart.png'
            )
        else:
            output_path = os.path.join(
                'charts',
                f'{file_name.split(".")[0]}_{chart_type}_{library}_chart.png'
            )

        # Save the chart
        full_output_path = os.path.join(current_app.static_folder, output_path)
        print("image output path:", full_output_path)
        output_fig.savefig(full_output_path)

        # Save chart information to the database
        new_chart = Chart(
            user=username,
            file_path=file_path,
            date=datetime.now(),
            choix_X=x_axis,
            choix_Y=y_axis,
            filter_type=filter_type,
            filter_value=filter_value,
            library=library,
            image_path=output_path
        )

        # Add to session and commit
        db.session.add(new_chart)

        #print("Saving statistics:", new_chart)
        db.session.commit()

        return jsonify({'status': 'success', 'output_path': output_path})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500





# Route to fetch available filter options based on selected X and Y axes (GET)
@visualization_bp.route('/get-filter-options', methods=['GET'])
def get_filter_options():
    x_axis = request.args.get('x_axis')
    y_axis = request.args.get('y_axis')
    
    # Check if X axis is selected
    if not x_axis:
        return jsonify({'status': 'error', 'message': 'X-axis is required'}), 400

    # Determine the data type of X and Y axes (for simplicity, we'll assume numeric or categorical)
    x_is_numeric = is_column_numeric(x_axis)
    y_is_numeric = is_column_numeric(y_axis) if y_axis else None

    # Determine the best filter types based on X and Y axes data types
    filter_types = []

    # General filters for X axis
    if x_is_numeric:
        filter_types.extend(['Top', 'Below', 'Comparison (X_axis > )', 'Comparison (X_axis < )'])  # Filters for numeric data
    

    if y_is_numeric:
        # If Y is numeric, allow comparison filters for Y
        filter_types.append('Comparison (Y_axis > )')
        filter_types.append('Comparison (Y_axis < )')
    
    # If there is no Y axis, do not show filters related to Y
    if not y_axis:
        filter_types = [filter for filter in filter_types if filter not in ['Comparison (Y_axis > )', 'Comparison (Y_axis < )']]
    
    # Show the filter types
    print("Available Filters:", filter_types)

    return jsonify({'status': 'success', 'filter_types': filter_types})

def is_column_numeric(column_name):
    # This is a dummy check. Replace this with logic to check the column data type in the actual file.
    return column_name.lower() in ['age', 'income', 'value', 'quantity']  # Example numeric columns






@visualization_bp.route('/calculate-statistics', methods=['GET'])
def calculate_statistics():
    filename = request.args.get('filename')
    variable = request.args.get('variable')
    username = request.args.get('username')
    print('Filename:', filename)
    print('Variable:', variable)
    print('username' , username)

    if not filename or not variable:
        return jsonify({'status': 'error', 'message': 'File or variable not specified'}), 400

    file_path = os.path.join(current_app.static_folder, 'data_saved', filename)
    if not os.path.exists(file_path):
        return jsonify({'status': 'error', 'message': f'File {filename} not found'}), 404

    try:
        df = pd.read_csv(file_path)
        if variable not in df.columns:
            return jsonify({'status': 'error', 'message': 'Variable not found in file'}), 400

        column_data = df[variable].dropna()

        # Calculate statistics
        stats = {
            'mean': column_data.mean(),
            'median': column_data.median(),
            'variance': column_data.var(),
            'quartiles': column_data.quantile([0.25, 0.5, 0.75]).to_dict(),
            'skewness': skew(column_data),
            'kurtosis': kurtosis(column_data)
        }

        # Save the statistics into the database
        # Assuming user is authenticated and you have a way to get the current user
        current_user = username  # Replace with actual logic to get the current user

        statistics_entry = Statistics(
            user=current_user,
            file_path=filename,
            column=variable,
            mean=stats['mean'],
            median=stats['median'],
            variance=stats['variance'],
            quartiles=str(stats['quartiles']),  # Save quartiles as a string
            skewness=stats['skewness'],
            kurtosis=stats['kurtosis']
        )

        # Add to the session and commit
        db.session.add(statistics_entry)
        print("Saving statistics:", stats)
        db.session.commit()
        saved_stat = Statistics.query.filter_by(file_path=filename, column=variable).first()
        print("Saved stat:", saved_stat)
        

        return jsonify({'status': 'success', 'statistics': stats})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500




@visualization_bp.route('/get-statistics', methods=['GET'])
def get_statistics():
    try:
        # Get query parameters for username and file name
        username = request.args.get('username')
        file_name = request.args.get('file_name')
        # Fetch user ID based on username
        user = User.query.filter_by(username=username).first()  # Assuming you have a User model with a 'username' field
        print("id" , user.id)
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        # Now use the user_id to filter statistics
        stats = Statistics.query.filter_by( file_path=file_name, user = username).all()
        statistics_list = [
            {
                'id': stat.id,
                'mean': stat.mean,
                'median': stat.median,
                'variance': stat.variance,
                'quartiles': stat.quartiles,
                'skewness': stat.skewness,
                'kurtosis': stat.kurtosis,
                'user': stat.user,  # User ID in the statistics
                'file_path': stat.file_path ,  # File path in the statistics
                'column' : stat.column

            }
            for stat in stats
        ]
        
        return jsonify({'status': 'success', 'statistics': statistics_list})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@visualization_bp.route('/delete-statistic/<int:stat_id>', methods=['DELETE'])
def delete_statistic(stat_id):
    try:
        # Fetch the statistic by id
        stat = Statistics.query.get(stat_id)

        if not stat:
            return jsonify({'status': 'error', 'message': 'Statistic not found'}), 404
        
        # Delete the statistic from the database
        db.session.delete(stat)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Statistic deleted successfully'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

