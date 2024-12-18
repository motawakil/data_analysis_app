class Config:
    # Database URI
    SQLALCHEMY_DATABASE_URI = 'sqlite:///data_analysis.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload settings
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Secret key for sessions and cookies
    SECRET_KEY = 'your_secret_key'  # Change this for production
