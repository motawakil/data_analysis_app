import pandas as pd
import numpy as np

def process_data(filepath):
    """
    Process the uploaded data file
    """
    try:
        # Read the file based on its extension
        if filepath.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filepath.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(filepath)
        elif filepath.endswith('.json'):
            df = pd.read_json(filepath)
        else:
            return {'error': 'Unsupported file format'}

        # Basic preprocessing steps
        processed_data = {
            'columns': df.columns.tolist(),
            'shape': df.shape,
            'missing_values': df.isnull().sum().to_dict(),
            'dtypes': df.dtypes.astype(str).to_dict(),
            'summary': df.describe().to_dict()
        }

        return processed_data

    except Exception as e:
        return {'error': str(e)}
