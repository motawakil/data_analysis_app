# database/models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'


class Chart(db.Model):
    __tablename__ = 'charts'
    
    # Define the columns (attributes) for this table
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.String(255), nullable=False)  # User who created the chart
    file_path = db.Column(db.String(255), nullable=False)  # Path to the file used for the chart
    date = db.Column(db.DateTime, nullable=False)  # Timestamp when chart was created
    choix_X = db.Column(db.String(255), nullable=False)  # X-axis selection
    choix_Y = db.Column(db.String(255), nullable=True)  # Y-axis selection (can be null)
    filter_type = db.Column(db.String(255), nullable=True)  # Filter type applied (can be null)
    filter_value = db.Column(db.String(255), nullable=True)  # Filter value (can be null)
    library = db.Column(db.String(255), nullable=False)  # Library used (matplotlib or seaborn)
    image_path = db.Column(db.String(255), nullable=False)  # Path to the generated chart image

    def __init__(self, user, file_path, date, choix_X, choix_Y, filter_type, filter_value, library, image_path):
        self.user = user
        self.file_path = file_path
        self.date = date
        self.choix_X = choix_X
        self.choix_Y = choix_Y
        self.filter_type = filter_type
        self.filter_value = filter_value
        self.library = library
        self.image_path = image_path

class Statistics(db.Model):
    __tablename__ = 'statistics'
    
    # Define the columns (attributes) for this table
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.String(255), nullable=False)  # User who created the statistics
    file_path = db.Column(db.String(255), nullable=False)  # Path to the file used for statistics
    column = db.Column(db.String(255), nullable=False)  # Column name for statistics
    mean = db.Column(db.Float, nullable=True)  # Mean value
    median = db.Column(db.Float, nullable=True)  # Median value
    variance = db.Column(db.Float, nullable=True)  # Variance value
    quartiles = db.Column(db.String(255), nullable=True)  # Quartiles as a string (e.g., 'Q1: 25, Q2: 50, Q3: 75')
    skewness = db.Column(db.Float, nullable=True)  # Skewness value
    kurtosis = db.Column(db.Float, nullable=True)  # Kurtosis value

    def __init__(self, user, file_path, column, mean, median, variance, quartiles, skewness, kurtosis):
        self.user = user
        self.file_path = file_path
        self.column = column
        self.mean = mean
        self.median = median
        self.variance = variance
        self.quartiles = quartiles
        self.skewness = skewness
        self.kurtosis = kurtosis
