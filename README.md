# Data Analysis ML Application

This is a Flask-based desktop application for data analysis with machine learning capabilities.

## Development Setup Guide

### 1. Activate the Virtual Environment

First, navigate to the project directory:
```bash
cd /path/to/data_analysis_app
```

Then activate the virtual environment:
- On Linux/Mac:
  ```bash
  source venv/bin/activate
  ```
- On Windows:
  ```bash
  .\venv\Scripts\activate
  ```

You'll know it's activated when you see `(venv)` at the beginning of your terminal prompt.

### 2. Start the Flask Application

Once the virtual environment is activated, start the Flask application:
```bash
python app.py
```

The application will be available at: http://localhost:5000

### 3. Development Workflow

- Make your code changes in your preferred editor
- The Flask development server will automatically reload when you save changes
- View the changes in your web browser at http://localhost:5000
- Check the terminal for any error messages or logs

### 4. Installing New Dependencies

If you need to install new Python packages:
```bash
pip install package_name
```

Don't forget to update requirements.txt after installing new packages:
```bash
pip freeze > requirements.txt
```

### 5. Deactivate the Virtual Environment

When you're done working, deactivate the virtual environment:
```bash
deactivate
```

## Project Structure (updated)

```
data_analysis_app/
├── app/                            # Main application package
│   ├── __init__.py                # App initialization and configuration
│   ├── MLmodels/                  # Machine Learning models
│   │   └── MLmodel.py            # ML model implementations
│   ├── database/                  # Database related code
│   │   ├── __init__.py
│   │   ├── db.py                 # Database configuration
│   │   └── models.py             # Database models
│   ├── export/                    # Export functionality
│   │   ├── __init__.py
│   │   └── export_utils.py       # Export utilities
│   ├── preprocessing/             # Data preprocessing
│   │   └── preprocess.py         # Preprocessing functions
│   ├── routes/                    # Application routes
│   │   ├── data_routes.py        # Data handling endpoints
│   │   ├── export_routes.py      # Export endpoints
│   │   ├── training_routes.py    # ML training endpoints
│   │   └── visualization_routes.py# Visualization endpoints
│   └── visualization/             # Visualization code
│       └── charts.py             # Chart generation
├── static/                        # Static files
│   └── js/                       # JavaScript files
│       ├── analysis.js           # Analysis page functionality
│       ├── export.js             # Export functionality
│       └── import.js             # Import functionality
        └── visualisation.js             # Visualisation functionality

├── templates/                     # HTML templates
│   ├── about.html                # About page
│   ├── analysis.html             # Data analysis page
│   ├── base.html                 # Base template
│   ├── documentation.html        # Documentation page
│   ├── export.html               # Export page
│   ├── home.html                 # Home page
│   ├── import.html               # Import page
│   └── visualization.html        # Visualization page
├── uploads/                      # Directory for uploaded files
├── app.py                        # Application entry point
├── config.py                     # Configuration settings
├── requirements.txt              # Project dependencies
└── README.md                     # Project documentation
```
