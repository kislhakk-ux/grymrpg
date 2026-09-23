# GymForge — WSGI / ASGI Adaptor for PythonAnywhere
# In PythonAnywhere, you can configure your WSGI configuration file to import this application.

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app import app as fastapi_app

# For ASGI servers on PythonAnywhere (or via a2wsgi / asgiref):
try:
    from a2wsgi import ASGIMiddleware
    application = ASGIMiddleware(fastapi_app)
except ImportError:
    # If using standard ASGI runner
    application = fastapi_app
