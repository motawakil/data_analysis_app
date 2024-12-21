import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from matplotlib import cm
import numpy as np


# Matplotlib Bar Chart with Y-axis filters
def mpl_bar_chart(file_path, x_axis, y_axis=None, title=None, filter=None):
    df = pd.read_csv(file_path)

    # Apply filter if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        if filter_type == 'Comparison (Y_axis >)' and filter_value is not None and y_axis:
            df = df[df[y_axis] > filter_value]
        elif filter_type == 'Comparison (Y_axis <)' and filter_value is not None and y_axis:
            df = df[df[y_axis] < filter_value]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    df[x_axis] = df[x_axis].astype(str)  # Convert X to string for categorical charts

    if y_axis:  # X categorical, Y numeric
        ax.bar(df[x_axis], df[y_axis], color='blue')
        ax.set_ylabel(y_axis)
    else:  # X categorical only
        value_counts = df[x_axis].value_counts()
        ax.bar(value_counts.index, value_counts.values, color='blue')
        ax.set_ylabel("Count")
    
    ax.set_xlabel(x_axis)
    ax.set_title(title or f"Bar Chart: {x_axis} {'vs ' + y_axis if y_axis else ''}")
    ax.tick_params(axis='x', rotation=45)
    return fig


# Matplotlib Scatter Chart
# Matplotlib Scatter Chart with 6 Filters
def mpl_scatter_chart(file_path, x_axis, y_axis, filter=None, title=None):
    df = pd.read_csv(file_path)
    
    # Apply filters if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        
        if filter_type == 'Top' and filter_value is not None:
            df = df.nlargest(filter_value, x_axis)
        elif filter_type == 'Below' and filter_value is not None:
            df = df.nsmallest(filter_value, x_axis)
        elif filter_type == 'Comparison (X_axis >)' and filter_value is not None:
            df = df[df[x_axis] > filter_value]
        elif filter_type == 'Comparison (X_axis <)' and filter_value is not None:
            df = df[df[x_axis] < filter_value]
        elif filter_type == 'Comparison (Y_axis >)' and filter_value is not None:
            df = df[df[y_axis] > filter_value]
        elif filter_type == 'Comparison (Y_axis <)' and filter_value is not None:
            df = df[df[y_axis] < filter_value]
    
    # Plot scatter chart
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.scatter(df[x_axis], df[y_axis], color='green')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f"Scatter Chart: {y_axis} vs {x_axis}")
    return fig


# Matplotlib Histogram Chart
def mpl_histogram_chart(file_path, x_axis, filter=None, title=None):
    df = pd.read_csv(file_path)
    
    # Apply filter if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        
        # Handle different filter types
        if filter_type == 'Comparison (X_axis > )' and filter_value is not None:
            df = df[df[x_axis] > filter_value]
        elif filter_type == 'Comparison (X_axis < )' and filter_value is not None:
            df = df[df[x_axis] < filter_value]
        elif filter_type == 'Top' and filter_value is not None:  # Top N largest values
            df = df.nlargest(filter_value, x_axis)
        elif filter_type == 'Below' and filter_value is not None:  # Bottom N smallest values
            df = df.nsmallest(filter_value, x_axis)

    # Plot histogram
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.hist(df[x_axis].dropna(), bins=20, color='purple')
    ax.set_xlabel(x_axis)
    ax.set_ylabel("Frequency")
    ax.set_title(title or f"Histogram: {x_axis} ")
    return fig

# Matplotlib Line Chart with 6 Filters
def mpl_line_chart(file_path, x_axis, y_axis, filter=None, title=None):
    df = pd.read_csv(file_path)
    
    # Apply filters if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        
        if filter_type == 'Top' and filter_value is not None:
            df = df.nlargest(filter_value, x_axis)
        elif filter_type == 'Below' and filter_value is not None:
            df = df.nsmallest(filter_value, x_axis)
        elif filter_type == 'Comparison (X_axis >)' and filter_value is not None:
            df = df[df[x_axis] > filter_value]
        elif filter_type == 'Comparison (X_axis <)' and filter_value is not None:
            df = df[df[x_axis] < filter_value]
        elif filter_type == 'Comparison (Y_axis >)' and filter_value is not None:
            df = df[df[y_axis] > filter_value]
        elif filter_type == 'Comparison (Y_axis <)' and filter_value is not None:
            df = df[df[y_axis] < filter_value]
    
    # Plot line chart
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(df[x_axis], df[y_axis], color='orange')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f"Line Chart: {y_axis} vs {x_axis}")
    return fig


# Matplotlib Pie Chart
def mpl_pie_chart(file_path, x_axis, title=None):
    df = pd.read_csv(file_path)
    values = df[x_axis].value_counts()
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.pie(values, labels=values.index, autopct='%1.1f%%', colors=plt.cm.tab10.colors)
    ax.set_title(title or f"Pie Chart: {x_axis}")
    return fig

# Matplotlib Box Plot with Y-axis filters
def mpl_box_chart(file_path, x_axis, y_axis, title=None, filter=None):
    df = pd.read_csv(file_path)

    # Apply filter if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        if filter_type == 'Comparison (Y_axis >)' and filter_value is not None:
            df = df[df[y_axis] > filter_value]
        elif filter_type == 'Comparison (Y_axis <)' and filter_value is not None:
            df = df[df[y_axis] < filter_value]

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.boxplot(data=df, x=x_axis, y=y_axis, ax=ax)
    ax.set_title(title or f"Box Plot: {y_axis} by {x_axis}")
    return fig

# Matplotlib Violin Plot with Y-axis filters
def mpl_violin_chart(file_path, x_axis, y_axis, title=None, filter=None):
    df = pd.read_csv(file_path)

    # Apply filter if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        if filter_type == 'Comparison (Y_axis >)' and filter_value is not None:
            df = df[df[y_axis] > filter_value]
        elif filter_type == 'Comparison (Y_axis <)' and filter_value is not None:
            df = df[df[y_axis] < filter_value]

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.violinplot(data=df, x=x_axis, y=y_axis, ax=ax)
    ax.set_title(title or f"Violin Plot: {y_axis} by {x_axis}")
    return fig


# Matplotlib KDE Plot
def mpl_kde_chart(file_path, x_axis, title=None, filter=None):
    df = pd.read_csv(file_path)
    
    # Apply filter if provided (same logic as sns_kde_chart)
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        
        if filter_type == 'Comparison (X_axis > )' and filter_value is not None:
            df = df[df[x_axis] > filter_value]
        elif filter_type == 'Comparison (X_axis < )' and filter_value is not None:
            df = df[df[x_axis] < filter_value]
        # You can add more filter conditions here if necessary

    # Plot KDE
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.kdeplot(data=df, x=x_axis, fill=True, color="blue", ax=ax)
    ax.set_xlabel(x_axis)
    ax.set_title(title or f"KDE Plot: {x_axis}")
    return fig

# Matplotlib Heatmap with 6 Filters
def mpl_heatmap_chart(file_path, x_axis, y_axis, filter=None, title=None):
    df = pd.read_csv(file_path)
    
    # Apply filters if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        
        if filter_type == 'Top' and filter_value is not None:
            df = df.nlargest(filter_value, x_axis)
        elif filter_type == 'Below' and filter_value is not None:
            df = df.nsmallest(filter_value, x_axis)
        elif filter_type == 'Comparison (X_axis >)' and filter_value is not None:
            df = df[df[x_axis] > filter_value]
        elif filter_type == 'Comparison (X_axis <)' and filter_value is not None:
            df = df[df[x_axis] < filter_value]
        elif filter_type == 'Comparison (Y_axis >)' and filter_value is not None:
            df = df[df[y_axis] > filter_value]
        elif filter_type == 'Comparison (Y_axis <)' and filter_value is not None:
            df = df[df[y_axis] < filter_value]
    
    # Create cross-tabulation for heatmap
    cross_tab = pd.crosstab(df[x_axis], df[y_axis])
    
    # Plot heatmap
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.heatmap(cross_tab, annot=True, cmap="Blues", ax=ax)
    ax.set_title(title or f"Heatmap: {x_axis} vs {y_axis}")
    return fig



# Matplotlib Swarm Plot
def mpl_swarm_plot_chart(file_path, x_axis, y_axis, filter=None, title=None):
    df = pd.read_csv(file_path)

    # Apply filter if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')

        # Handle different filter types
        if filter_type == 'Comparison (X_axis > )' and filter_value is not None:
            df = df[df[x_axis] > filter_value]
        elif filter_type == 'Comparison (X_axis < )' and filter_value is not None:
            df = df[df[x_axis] < filter_value]
        elif filter_type == 'Top' and filter_value is not None:
            df = df.nlargest(filter_value, x_axis)
        elif filter_type == 'Below' and filter_value is not None:
            df = df.nsmallest(filter_value, x_axis)

    # Plot swarm-like visualization using Matplotlib
    fig, ax = plt.subplots(figsize=(10, 6))
    unique_categories = df[x_axis].dropna().unique()
    positions = np.arange(len(unique_categories))
    
    # Generate swarm data
    for idx, category in enumerate(unique_categories):
        values = df[df[x_axis] == category][y_axis].dropna()
        jitter = np.random.normal(0, 0.1, size=len(values))  # Add jitter to x positions
        ax.scatter(positions[idx] + jitter, values, alpha=0.7, label=category, s=30)

    ax.set_xticks(positions)
    ax.set_xticklabels(unique_categories)
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f"Swarm Plot: {x_axis} vs {y_axis}")
    ax.legend(title=x_axis, bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    return fig
