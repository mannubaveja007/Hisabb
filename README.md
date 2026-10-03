# Hisabb (Local-First Voice Credit Ledger)

Local-first, voice-driven credit ledger for small retail shops in India.

## Subdirectories
- `backend/` - FastAPI backend with faster-whisper, Ollama (qwen2.5:3b), SQLite, and RapidFuzz.
- `CONTRACT.md` - OpenAPI 3.1 specification, SQLite DDL, and TypeScript response contracts.
- `context.md` - Specification and schema reference.

## Quickstart (Backend)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

Run tests:
```bash
cd backend
pytest tests/ -v
```
