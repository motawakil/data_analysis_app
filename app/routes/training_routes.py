from flask import Blueprint, render_template, request, jsonify, current_app
import os

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

# Route to train model (POST)
@training_bp.route("/train_model", methods=["POST"])
def train_model():
    # Parse JSON data from the request
    request_data = request.get_json()
    if not request_data:
        return jsonify({"message": "No data provided"}), 400

    print("Received Data:", request_data)

    # Extract data from the request
    selected_file = request_data.get("file")
    algorithm = request_data.get("algorithm")
    parameters = request_data.get("parameters", {})

    # Log received information
    print(f"Selected File: {selected_file}")
    print(f"Algorithm: {algorithm}")
    print(f"Parameters: {parameters}")

    # Validate essential inputs
    if not selected_file or not algorithm:
        return jsonify({"message": "File and algorithm are required"}), 400

    # Example: Process the data and prepare it for the ML pipeline
    response = {
        "message": "Model training initiated successfully!",
        "file": selected_file,
        "algorithm": algorithm,
        "parameters": parameters
    }
    return jsonify(response)


