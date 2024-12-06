def create_visualization(data):
    """
    Create visualization based on the input data
    """
    try:
        chart_type = data.get('type', 'bar')
        chart_data = data.get('data', {})
        
        # Create visualization based on chart type
        visualization = {
            'type': chart_type,
            'data': chart_data,
            # Add more visualization settings here
        }
        
        return visualization
    
    except Exception as e:
        return {'error': str(e)}
