from flask import Blueprint, render_template, request, jsonify, current_app
import os
from app.ML_models.ml_model import LinearRegressionModel , KNNModel
import pandas as pd 
import csv  

training_bp = Blueprint('training', __name__)

@training_bp.route('/analysis')
def analysis():
    return render_template('analysis.html')

# Route to fetch the list of available files (GET)
@training_bp.route('/get-files', methods=['GET'])
def get_files():
    data_saved_path = os.path.join(current_app.static_folder, 'data_saved')
    files = [
        {'id': file, 'name': file}
        for file in os.listdir(data_saved_path)
        if file.endswith('.csv')
    ] if os.path.exists(data_saved_path) else []
    return jsonify(files)


# Route to fetch the columns of a specific CSV file (GET)
@training_bp.route('/get-columns', methods=['GET'])
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




    # Route to train model (POST) And receive the user choices 

@training_bp.route("/train_model", methods=["POST"])
def train_model():
    """
    Route to train the selected model and return results.
    """
    try:
        # Parse JSON data from the request
        request_data = request.get_json()
        if not request_data:
            return jsonify({"message": "No data provided"}), 400

        print("Received Data:", request_data)

        # Extract data from the request
        selected_file = request_data.get("file")
        algorithm = request_data.get("algorithm")
        parameters = request_data.get("parameters", {})
        target = parameters.get("target")  # Use None as the default if 'target' is not found

        # Validate essential inputs
        if not selected_file or not algorithm:
            return jsonify({"message": "File and algorithm are required"}), 400

        # Check the algorithm and call the respective function
        if algorithm.lower() == "regression":
            # Call the regression model training function
            result = train_regression_model(selected_file, parameters, target)

            # Send the performance metrics as JSON response
            return jsonify({
                "status": "success",
                "performance": result,
                "algorithm" : algorithm
            }), 200

        # Handle unsupported algorithms
        return jsonify({"message": f"Algorithm '{algorithm}' is not supported"}), 400

    except Exception as e:
        # Handle errors and send error response
        print(f"Error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400


def train_regression_model(file, parameters, target):
    """
    Wrapper function for training a Linear Regression model.
    """
    # Normalize parameter keys to lowercase
    parameters = {k.lower(): v for k, v in parameters.items()}
    print("Normalized Parameters:", parameters)

    # Extract split type
    split_type = parameters.get("splittype")  # Access normalized key
    split_value = parameters.get("splitdetail")
    print("split value is:", split_value)
    if not split_type:
        raise ValueError("Missing required parameter: 'splitType'")

    # Construct the file path
    file_path = os.path.join(current_app.static_folder, 'data_saved', file)

    # Load the data into a DataFrame
    try:
        data = pd.read_csv(file_path)
    except Exception as e:
        raise ValueError(f"Error loading file: {e}")

    # Ensure 'target' exists in the data
    print("Data columns:", data.columns)
    if target not in data.columns:
        raise ValueError(f"The provided dataset does not contain a '{target}' column.")

    # Split the data into features (X) and target (y)
    X = data.drop(target, axis=1)
    y = data[target]

    # Pass split type and other parameters for model training
    regression_model = LinearRegressionModel(
        preprocessing_params=parameters,
        split_params={"type": split_type, "train_size": split_value},
        hyperparameters={"include_intercept": parameters.get("includeintercept", True)}
    )
    performance = regression_model.train(X, y)

    # Log and return the performance metrics
    print("Performance:", performance)
    return performance



def train_knn_model(file, parameters, target):
    """
    Wrapper function for training a KNN model.
    """
    # Normalize parameter keys to lowercase
    parameters = {k.lower(): v for k, v in parameters.items()}

    # Extract split type
    split_type = parameters.get("splittype")
    split_value = parameters.get("splitdetail")

    # Construct the file path
    file_path = os.path.join(current_app.static_folder, 'data_saved', file)

    # Load the data into a DataFrame
    try:
        data = pd.read_csv(file_path)
    except Exception as e:
        raise ValueError(f"Error loading file: {e}")

    # Ensure 'target' exists in the data
    if target not in data.columns:
        raise ValueError(f"The provided dataset does not contain a '{target}' column.")

    # Split the data into features (X) and target (y)
    X = data.drop(target, axis=1)
    y = data[target]

    # Pass split type and other parameters for model training
    knn_model = KNNModel(
        preprocessing_params=parameters,
        split_params={"type": split_type, "train_size": split_value},
        hyperparameters={
            "n_neighbors": int(parameters.get("n_neighbors", 5)),
            "weights": parameters.get("weights", "uniform"),
            "algorithm": parameters.get("algorithm", "auto")
        }
    )

    performance = knn_model.train(X, y)

    # Log and return the performance metrics
    print("Performance:", performance)
    return performance
