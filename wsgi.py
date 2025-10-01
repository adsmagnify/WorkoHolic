#!/usr/bin/python3.10

import sys
import os

# Add the project directory to the Python path
sys.path.insert(0, '/home/yourusername/WorkoHolic')

# Import the Flask app
from app import app

# This is the WSGI application that PythonAnywhere will use
application = app

if __name__ == "__main__":
    app.run()
