from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/import')
def import_data():
    return render_template('import.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/visualization')
def visualization():
    return render_template('visualization.html')

@app.route('/export')
def export():
    return render_template('export.html')

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read the file and get preview data
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(filepath)
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(filepath)
            elif filename.endswith('.json'):
                df = pd.read_json(filepath)
            
            preview_data = {
                'columns': df.columns.tolist(),
                'data': df.head(10).to_dict('records'),
                'info': {
                    'total_rows': len(df),
                    'missing_values': df.isnull().sum().to_dict()
                }
            }
            return jsonify(preview_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/process_data', methods=['POST'])
def process_data():
    data = request.json
    filename = data.get('filename')
    operations = data.get('operations', [])
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
    
    try:
        # Load the data
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(filepath)
        elif filename.endswith('.json'):
            df = pd.read_json(filepath)
            
        # Apply operations
        for operation in operations:
            if operation == 'clean':
                df = df.dropna()
            elif operation == 'fill_missing':
                df = df.fillna(df.mean(numeric_only=True))
            elif operation == 'normalize':
                numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns
                df[numeric_columns] = (df[numeric_columns] - df[numeric_columns].mean()) / df[numeric_columns].std()
        
        # Save processed data
        processed_filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'processed_' + filename)
        df.to_csv(processed_filepath, index=False)
        
        return jsonify({
            'message': 'Data processed successfully',
            'preview': df.head(10).to_dict('records')
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
