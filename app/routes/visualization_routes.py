import os
import csv
from flask import Blueprint, current_app, jsonify, request
from app.visualization.matplotlib_charts import *
from app.visualization.seaborn_charts import *
import matplotlib.pyplot as plt

# Create a Blueprint
visualization_bp = Blueprint('visualization', __name__)

# Route to fetch the list of available files (GET)
@visualization_bp.route('/get-files', methods=['GET'])
def get_files():
    data_saved_path = os.path.join(current_app.static_folder, 'data_saved')
    files = [
        {'id': file, 'name': file}
        for file in os.listdir(data_saved_path)
        if file.endswith('.csv')
    ] if os.path.exists(data_saved_path) else []
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
    if x_is_numeric:
        if not y_is_numeric:
            # Only numeric X axis, charts that can work with just X
            chart_types = ['histogram']  # X is numeric, but no Y axis (single axis charts)
        elif y_is_numeric:
            # Both X and Y are numeric, charts that require both axes
            chart_types = ['scatter', 'line', 'time_series']  # Both axes numeric

    elif not x_is_numeric and not y_is_numeric:
        # Categorical X and Categorical Y, charts that require both axes to be categorical
        chart_types = ['box']  # Categorical X, Categorical Y (Pie for categorical X only)

    elif not x_is_numeric and y_is_numeric:
        # Categorical X and Numeric Y axis, charts that require a categorical X and numerical Y
        chart_types = ['bar', 'box', 'heatmap']  # Categorical X, Numeric Y

    elif not x_is_numeric and y_axis == None :
        # Only Categorical X axis, charts that require only the X axis (no Y axis needed)
        chart_types = ['pie' ]  # Categorical X without Y


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
    data = request.json

    # Extract parameters
    file_name = data.get('file_name')
    chart_type = data.get('chart_type')
   
    x_axis = data.get('x_axis')
    y_axis = data.get('y_axis')
    filters = data.get('filters', {})
    library = data.get('library')
    print(library)
    additional_params = data.get('additional_params', {})  # For extra customization like titles

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
        if filters:
            chart_args.update(filters)
        if additional_params:
            chart_args.update(additional_params)

        # Generate the chart
        print(chart_args)
        output_fig = chart_function(**chart_args)

        # Save the chart
        output_path = os.path.join(
            'charts',
            f'{file_name.split(".")[0]}_{chart_type}_{library}_chart.png'
        )
        full_output_path = os.path.join(current_app.static_folder, output_path)
        output_fig.savefig(full_output_path)

        return jsonify({'status': 'success', 'output_path': output_path})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500



# Route to fetch columns for statistics (GET)
@visualization_bp.route('/get-statistics-columns', methods=['GET'])
def get_statistics_columns():
    filename = request.args.get('filename')
    if not filename:
        return jsonify({'status': 'error', 'message': 'No file specified'}), 400

    data_saved_path = os.path.join(current_app.static_folder, 'data_saved', filename)
    if not os.path.exists(data_saved_path):
        return jsonify({'status': 'error', 'message': f'File {filename} not found'}), 404

    with open(data_saved_path, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        columns = reader.fieldnames

    return jsonify({'status': 'success', 'columns': columns})
