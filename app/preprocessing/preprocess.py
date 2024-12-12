import pandas as pd

def get_missing_values(df):
    """
    Function to compute the total and percentage of missing values per column.
    """
    missing_values = df.isnull().sum()
    percent_missing = (missing_values / len(df)) * 100

    return {
        'total_missing': missing_values.to_dict(),
        'percent_missing': percent_missing.round(2).to_dict()
    }

def get_unique_values(df):
    """
    Function to get the number of unique values per column.
    """
    unique_values = df.nunique()
    return unique_values.to_dict()

def preprocess_data(df):
    """
    Function to preprocess data and return relevant information.
    """
    results = {
        'missing_values': get_missing_values(df),
        'unique_values': get_unique_values(df)
    }

    return results

