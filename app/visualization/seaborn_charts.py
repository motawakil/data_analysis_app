import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd


# Seaborn Functions

def sns_bar_chart(file_path, x_axis, y_axis=None, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    
    if y_axis:
        # Validate that y_axis is numeric
        if not pd.api.types.is_numeric_dtype(df[y_axis]):
            raise ValueError(f"{y_axis} must be a numerical column for a bar chart.")
        sns.barplot(data=df, x=x_axis, y=y_axis, ax=ax, color='teal')
        ax.set_ylabel(y_axis)
    else:
        # Compute frequency counts for categorical x_axis
        value_counts = df[x_axis].dropna().value_counts().reset_index()
        value_counts.columns = [x_axis, 'Frequency']
        sns.barplot(data=value_counts, x=x_axis, y='Frequency', ax=ax, color='teal')
        ax.set_ylabel('Frequency')

    ax.set_xlabel(x_axis)
    ax.set_title(title or f'Bar Chart: {x_axis} vs {y_axis if y_axis else "Frequency"} with seaborn')
    ax.tick_params(axis='x', rotation=45)
    return fig


def sns_scatter_chart(file_path, x_axis, y_axis, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.scatterplot(data=df, x=x_axis, y=y_axis, ax=ax, color='purple')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f'Scatter Plot: {y_axis} vs {x_axis} with seaborn')
    return fig

def sns_histogram_chart(file_path, x_axis, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.histplot(data=df, x=x_axis, kde=True, ax=ax, color='orange')
    ax.set_xlabel(x_axis)
    ax.set_title(title or f'Histogram: {x_axis} with seaborn')
    return fig

def sns_line_chart(file_path, x_axis, y_axis, title=None):
    df = pd.read_csv(file_path)
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.lineplot(data=df, x=x_axis, y=y_axis, ax=ax, color='green')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f'Line Chart: {y_axis} vs {x_axis} with seaborn')
    return fig

def sns_pie_chart(file_path, x_axis, title=None):
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns

    df = pd.read_csv(file_path)

    # Calculate value counts for the categorical variable
    values = df[x_axis].value_counts()
    
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.pie(
        values, 
        labels=values.index, 
        autopct='%1.1f%%', 
        colors=sns.color_palette('pastel')
    )
    ax.set_title(title or f'Pie Chart: {x_axis} with Seaborn')
    return fig


# Seaborn Heatmap (Handles both X and Y as categorical or numeric)
def sns_heatmap_chart(file_path, x_axis, y_axis, title=None):
    df = pd.read_csv(file_path)
    
    # Check if columns exist
    if x_axis not in df.columns or y_axis not in df.columns:
        raise ValueError(f"Columns '{x_axis}' or '{y_axis}' not found in the dataset.")
    
    # For a heatmap, we pivot the data based on categorical X and Y
    pivot_table = df.pivot_table(values=y_axis, index=x_axis, aggfunc='mean')

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.heatmap(pivot_table, cmap='coolwarm', ax=ax, annot=True)
    ax.set_title(title or f'Heatmap: {y_axis} by {x_axis} with seaborn')
    return fig


# Seaborn Box Plot (Handles both X and Y as categorical or numeric)
def sns_box_chart(file_path, x_axis, y_axis=None, title=None):
    df = pd.read_csv(file_path)

    # Check if x_axis is in the dataset
    if x_axis not in df.columns:
        raise ValueError(f"Column '{x_axis}' not found in the dataset.")

    fig, ax = plt.subplots(figsize=(10, 6))

    if y_axis is None:  # If only x_axis is categorical, no Y variable
        # Plot a box plot using the X-axis as the grouping variable
        sns.boxplot(data=df, x=x_axis, ax=ax)
        ax.set_title(title or f'Box Plot: {x_axis} with seaborn (Categorical)')
    else:  # If y_axis is also provided (numeric or categorical)
        if y_axis not in df.columns:
            raise ValueError(f"Column '{y_axis}' not found in the dataset.")
        # Plot a box plot with both X and Y axes
        sns.boxplot(data=df, x=x_axis, y=y_axis, ax=ax)
        ax.set_title(title or f'Box Plot: {x_axis} vs {y_axis} with seaborn')

    return fig