import matplotlib.pyplot as plt
import csv
import pandas as pd

# Matplotlib Functions
def mpl_bar_chart(file_path, x_axis, y_axis=None, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Convert x_axis to string to ensure compatibility with categorical plotting
    df[x_axis] = df[x_axis].astype(str)

    if y_axis:
        # Check if y_axis is numerical
        if not pd.api.types.is_numeric_dtype(df[y_axis]):
            raise ValueError(f"{y_axis} must be a numerical column for a bar chart.")
        ax.bar(df[x_axis], df[y_axis], color='blue')
        ax.set_ylabel(y_axis)
    else:
        # Frequency count for categorical x_axis
        value_counts = df[x_axis].dropna().value_counts()
        ax.bar(value_counts.index.astype(str), value_counts.values, color='blue')
        ax.set_ylabel('Frequency')

    ax.set_xlabel(x_axis)
    ax.set_title(title or f'Bar Chart: {x_axis} vs {y_axis if y_axis else "Frequency"} with matplotlib')
    ax.tick_params(axis='x', rotation=45)
    return fig


def mpl_scatter_chart(file_path, x_axis, y_axis, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.scatter(df[x_axis], df[y_axis], color='green')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f'Scatter Chart: {y_axis} vs {x_axis} with matplotlib')
    return fig

def mpl_histogram_chart(file_path, x_axis, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.hist(df[x_axis].dropna(), bins=20, color='purple')
    ax.set_xlabel(x_axis)
    ax.set_ylabel('Frequency')
    ax.set_title(title or f'Histogram: {x_axis} with matplotlib')
    return fig

def mpl_line_chart(file_path, x_axis, y_axis, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(df[x_axis], df[y_axis], color='orange')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f'Line Chart: {y_axis} vs {x_axis} with matplotlib')
    return fig






def mpl_pie_chart(file_path, x_axis, title=None):


    df = pd.read_csv(file_path)

    # Calculate value counts for the categorical variable
    values = df[x_axis].value_counts()
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.pie(
        values, 
        labels=values.index, 
        autopct='%1.1f%%', 
        colors=plt.cm.tab10.colors
    )
    ax.set_title(title or f'Pie Chart: {x_axis} with Matplotlib')
    return fig



def mpl_bubble_chart(file_path, x_axis, y_axis, size, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    scatter = ax.scatter(df[x_axis], df[y_axis], s=df[size] * 10, alpha=0.5, color='pink')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f'Bubble Chart: {y_axis} vs {x_axis} with matplotlib')
    return fig

def mpl_time_series_chart(file_path, x_axis, y_axis, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(df[x_axis], df[y_axis], color='blue')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f'Time Series Chart: {y_axis} vs {x_axis} with matplotlib')
    return fig

def mpl_stacked_chart(file_path, x_axis, y_columns, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    df.set_index(x_axis)[y_columns].plot(kind='bar', stacked=True, ax=ax, color=plt.cm.tab20.colors)
    ax.set_xlabel(x_axis)
    ax.set_title(title or f'Stacked Chart: {y_columns} vs {x_axis} with matplotlib')
    return fig
