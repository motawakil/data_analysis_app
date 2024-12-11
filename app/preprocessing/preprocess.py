import pandas as pd
import os

# Function to check if the file is a valid type
def is_valid_file(file_path):
    valid_extensions = ['.csv', '.xlsx', '.json']
    file_extension = os.path.splitext(file_path)[1]
    return file_extension in valid_extensions

# Function to get file size in a human-readable format
def get_file_size(file_path):
    file_size = os.path.getsize(file_path)
    if file_size < 1024:
        return f'{file_size} bytes'
    elif file_size < 1048576:
        return f'{file_size / 1024:.2f} KB'
    else:
        return f'{file_size / 1048576:.2f} MB'

# Function to read the file based on its extension
def read_file(file_path):
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    elif file_path.endswith('.xlsx'):
        return pd.read_excel(file_path)
    elif file_path.endswith('.json'):
        return pd.read_json(file_path)
    else:
        raise ValueError("Unsupported file format")

# Function to extract basic file information
def extract_basic_info(df):
    info = {}
    # Get number of rows and columns
    info['num_rows'] = len(df)
    info['num_columns'] = len(df.columns)
    
    # Get column types
    info['column_types'] = df.dtypes.apply(str).to_dict()
    
    # Count missing values per column
    info['missing_values'] = df.isnull().sum().to_dict()

    return info

# Function to handle missing values (example: filling with 'N/A')
def handle_missing_values(df):
    return df.fillna('N/A')

# Function to preprocess the file: load, clean, and extract information
def preprocess_file(file_path):
    if not is_valid_file(file_path):
        raise ValueError("Invalid file type. Only CSV, Excel, and JSON are supported.")

    # Read file into dataframe
    df = read_file(file_path)

    # Extract basic file information (rows, columns, types, missing values)
    basic_info = extract_basic_info(df)

    # Handle missing values (you can choose to fill with 'N/A' or drop them)
    cleaned_df = handle_missing_values(df)

    # Return cleaned dataframe and basic info
    return cleaned_df, basic_info
