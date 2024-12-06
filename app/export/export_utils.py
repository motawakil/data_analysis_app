"""Utility functions for exporting data in different formats."""
import json
import pandas as pd
from pathlib import Path
from datetime import datetime

def get_export_path(filename, format_type):
    """Generate a unique export path."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    export_dir = Path("exports")
    export_dir.mkdir(exist_ok=True)
    return export_dir / f"{filename}_{timestamp}.{format_type}"

def export_to_csv(data, filename="export"):
    """Export data to CSV format."""
    if isinstance(data, pd.DataFrame):
        df = data
    else:
        df = pd.DataFrame(data)
    
    filepath = get_export_path(filename, "csv")
    df.to_csv(filepath, index=False)
    return str(filepath)

def export_to_excel(data, filename="export"):
    """Export data to Excel format."""
    if isinstance(data, pd.DataFrame):
        df = data
    else:
        df = pd.DataFrame(data)
    
    filepath = get_export_path(filename, "xlsx")
    df.to_excel(filepath, index=False)
    return str(filepath)

def export_to_json(data, filename="export"):
    """Export data to JSON format."""
    filepath = get_export_path(filename, "json")
    
    if isinstance(data, pd.DataFrame):
        data = data.to_dict(orient="records")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    return str(filepath)
