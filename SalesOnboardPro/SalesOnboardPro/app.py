import os
import logging
from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Import routes after app creation to avoid circular imports
from routes import *

# Application will be run by gunicorn in production
# Development server can be started with: python app.py
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
