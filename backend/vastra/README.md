# Vastra backend scaffold

This folder contains a minimal Flask scaffold (`app.py`) intended as a placeholder for integrating HR‑VITON or other heavy Python-based try-on services.

Quick start (Linux / Mac / Windows WSL):

1. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate   # or .\.venv\Scripts\activate on Windows
```

2. Install lightweight dependencies

```bash
pip install -r requirements.txt
```

3. Run the app

```bash
FLASK_APP=app.py flask run
```

Notes:
- The actual HR‑VITON model and its dependencies (detectron2, torch with CUDA, Graphonomy, etc.) are heavy and require a dedicated environment or GPU-enabled Docker container. This scaffold only accepts image uploads and saves them to disk; you should implement the model inference step where indicated in `app.py`.
