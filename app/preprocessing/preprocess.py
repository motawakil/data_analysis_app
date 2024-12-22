import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

import matplotlib
matplotlib.use('Agg')  # Use the Agg backend for non-GUI rendering

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

import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

def generate_top_categorical_plot(df):
    """
    Function to generate a bar plot for the top 2 frequent values of all categorical features.
    Returns the base64-encoded image of the plot.
    """
    categorical_columns = df.select_dtypes(include=['object', 'category']).columns
    top_values = {}

    # Collect top 2 frequent values for each categorical column
    for col in categorical_columns:
        top_values[col] = df[col].value_counts().nlargest(2)

    if not top_values:
        return None  # No categorical data to plot

    # Create a color palette for the columns
    colors = sns.color_palette("Set2", n_colors=len(top_values))

    # Plot the results
    plt.figure(figsize=(12, 8))

    # Loop to plot each column with its respective color
    for i, (col, values) in enumerate(top_values.items()):
        plt.bar([f"{col}: {val}" for val in values.index], values.values, label=col, color=colors[i])

    # Add legend to explain the color-column mapping
    plt.legend(title="Columns", bbox_to_anchor=(1.05, 1), loc='upper left')

    # Add title and labels
    plt.xticks(rotation=45, ha="right")
    plt.title("Bar Chart of Frequent Values for Categorical Features")
    plt.ylabel("Frequency")
    plt.tight_layout()

    # Convert plot to base64
    img = io.BytesIO()
    plt.savefig(img, format='png', bbox_inches='tight')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()

    return plot_url


def preprocess_data(df):
    """
    Function to preprocess data and return relevant information.
    """
    results = {
        'missing_values': get_missing_values(df),
        'unique_values': get_unique_values(df),
        'top_categorical_plot': generate_top_categorical_plot(df)
    }

    return results