"""Database models."""
from datetime import datetime
from .db import db

class Dataset(db.Model):
    """Model for storing dataset information."""
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text)
    
    # Add any additional fields you need for your datasets

    def __repr__(self):
        return f'<Dataset {self.name}>'

class Analysis(db.Model):
    """Model for storing analysis results."""
    
    id = db.Column(db.Integer, primary_key=True)
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'), nullable=False)
    analysis_type = db.Column(db.String(50), nullable=False)
    results = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    dataset = db.relationship('Dataset', backref=db.backref('analyses', lazy=True))

    def __repr__(self):
        return f'<Analysis {self.analysis_type} for Dataset {self.dataset_id}>'
