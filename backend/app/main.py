from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import (
    transcribe,
    parse,
    entries,
    customers,
    inventory,
    summary,
)

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Hisabb - Local-first voice-driven credit ledger for Indian Kirana & Retail stores",
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(transcribe.router)
app.include_router(parse.router)
app.include_router(entries.router)
app.include_router(customers.router)
app.include_router(inventory.router)
app.include_router(summary.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}
