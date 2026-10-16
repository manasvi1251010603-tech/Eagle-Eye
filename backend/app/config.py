import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
DEMO_DATA_DIR = os.path.join(BASE_DIR, "data", "demo")

# Ensure required directories exist
for directory in [UPLOADS_DIR, REPORTS_DIR, DEMO_DATA_DIR]:
    os.makedirs(directory, exist_ok=True)

DATABASE_PATH = os.path.join(BASE_DIR, "eagle_eye.sqlite3")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Default inspection settings
DEMO_MODE_DEFAULT = True

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
