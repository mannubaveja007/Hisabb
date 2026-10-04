import os
import sys

# Ensure backend directory is in sys.path so 'app' imports always resolve seamlessly
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from seed import seed_if_empty
from app.routes import (
    transcribe,
    parse,
    entries,
    customers,
    inventory,
    summary,
)

# Auto-create tables and populate a new demo database on startup.
Base.metadata.create_all(bind=engine)
seed_if_empty()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Hisabb - Local-first voice-driven credit ledger for Indian Kirana & Retail stores",
)

# CORS middleware for Next.js dev server or local PWA access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API route modules under /api
app.include_router(transcribe.router)
app.include_router(parse.router)
app.include_router(entries.router)
app.include_router(customers.router)
app.include_router(inventory.router)
app.include_router(summary.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}

# Resolve frontend static export path (frontend/out)
potential_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/out")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend/out")),
    os.path.abspath(os.path.join(os.getcwd(), "../frontend/out")),
]

frontend_out_dir = next((p for p in potential_paths if os.path.isdir(p)), None)


if frontend_out_dir:
    app.mount("/", StaticFiles(directory=frontend_out_dir, html=True), name="frontend_static")
