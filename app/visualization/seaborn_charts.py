import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd




# Seaborn Bar Chart with Y-axis filters
def sns_bar_chart(file_path, x_axis, y_axis=None, title=None, filter=None):
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
    
    if y_axis:
        if not pd.api.types.is_numeric_dtype(df[y_axis]):
            raise ValueError(f"{y_axis} must be a numerical column for a bar chart.")
        sns.barplot(data=df, x=x_axis, y=y_axis, ax=ax, color='teal')
        ax.set_ylabel(y_axis)
    else:
        value_counts = df[x_axis].dropna().value_counts().reset_index()
        value_counts.columns = [x_axis, 'Frequency']
        sns.barplot(data=value_counts, x=x_axis, y='Frequency', ax=ax, color='teal')
        ax.set_ylabel('Frequency')
    
    ax.set_xlabel(x_axis)
    ax.set_title(title or f"Bar Chart: {x_axis} {'vs ' + y_axis if y_axis else ''}")
    ax.tick_params(axis='x', rotation=45)
    return fig



# Seaborn Scatter Chart with 6 Filters
def sns_scatter_chart(file_path, x_axis, y_axis, title=None, filter=None):
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
    sns.scatterplot(data=df, x=x_axis, y=y_axis, ax=ax, color='purple')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f"Scatter Plot: {y_axis} vs {x_axis}")
    return fig




# Seaborn Histogram (X is numeric, Y is None)
def sns_histogram_chart(file_path, x_axis, title=None, filter=None):
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
    sns.histplot(data=df, x=x_axis, kde=True, ax=ax, color='orange')
    ax.set_xlabel(x_axis)
    ax.set_title(title or f"Histogram: {x_axis}")
    return fig


# Seaborn Line Chart with 6 Filters
def sns_line_chart(file_path, x_axis, y_axis, title=None, filter=None):
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
    sns.lineplot(data=df, x=x_axis, y=y_axis, ax=ax, color='green')
    ax.set_xlabel(x_axis)
    ax.set_ylabel(y_axis)
    ax.set_title(title or f"Line Chart: {y_axis} vs {x_axis}")
    return fig



# Seaborn Pie Chart (X is categorical, Y is None)
def sns_pie_chart(file_path, x_axis, title=None, filter=None):
    df = pd.read_csv(file_path)
    
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        if filter_type == 'Comparison (X_axis > )' and filter_value is not None:
            df = df[df[x_axis] > filter_value]

    values = df[x_axis].value_counts()
    
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.pie(
        values,
        labels=values.index,
        autopct='%1.1f%%',
        colors=sns.color_palette('pastel')
    )
    ax.set_title(title or f"Pie Chart: {x_axis}")
    return fig


# Seaborn Heatmap with 6 Filters
def sns_heatmap_chart(file_path, x_axis, y_axis, title=None, filter=None):
    df = pd.read_csv(file_path)
    
    if x_axis not in df.columns or y_axis not in df.columns:
        raise ValueError(f"Column '{x_axis}' or '{y_axis}' not found in the dataset.")
    
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
    
    grouped_df = df.groupby([x_axis]).mean(numeric_only=True)[y_axis].reset_index()

    try:
        pivot_table = grouped_df.pivot(index=x_axis, columns=None, values=y_axis)
    except ValueError as e:
        raise ValueError(f"Pivot failed: {e}. Check your data for duplicates or missing values.")
    
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.heatmap(pivot_table, cmap='coolwarm', annot=True, fmt=".1f", ax=ax)
    ax.set_title(title or f'Heatmap: {y_axis} by {x_axis}')
    return fig



# Seaborn Box Plot with Y-axis filters
def sns_box_chart(file_path, x_axis, y_axis=None, title=None, filter=None):
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

    if y_axis:
        sns.boxplot(data=df, x=x_axis, y=y_axis, ax=ax)
        ax.set_title(title or f"Box Plot: {x_axis} vs {y_axis}")
    else:
        sns.boxplot(data=df, x=x_axis, ax=ax)
        ax.set_title(title or f"Box Plot: {x_axis}")
    return fig



# Seaborn KDE Plot (X is numeric, Y is None)
def sns_kde_chart(file_path, x_axis, title=None, filter=None):
    df = pd.read_csv(file_path)
    
    # Apply filter if provided
    if filter:
        filter_type = filter.get('type')
        filter_value = filter.get('value')
        if filter_type == 'Comparison (X_axis > )' and filter_value is not None:
            df = df[df[x_axis] > filter_value]

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.kdeplot(data=df, x=x_axis, ax=ax, fill=True, color='blue')
    ax.set_xlabel(x_axis)
    ax.set_title(title or f"KDE Plot: {x_axis}")
    return fig



# Seaborn Swarm Plot
def sns_swarm_plot_chart(file_path, x_axis, y_axis, filter=None, title=None):
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

    # Plot swarm plot using Seaborn
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.swarmplot(data=df, x=x_axis, y=y_axis, ax=ax, palette="viridis", alpha=0.7)
    ax.set_title(title or f"Swarm Plot: {x_axis} vs {y_axis}")
    return fig
