# Hisabb Backend

Local-first, voice-driven credit ledger for small retail shops and Kiranas in India.

## Tech Stack
- **FastAPI** (Python 3.10+)
- **faster-whisper** (`base`, CPU, `int8` quantization)
- **Ollama** (`qwen2.5:3b`)
- **SQLite** via **SQLAlchemy**
- **RapidFuzz** (Fuzzy customer matching)
- **Pytest** & **HTTPX** (Testing)

---

## Prerequisites
1. **Python 3.10+** installed
2. **Ollama** installed and running:
   ```bash
   ollama pull qwen2.5:3b
   ollama serve
   ```

---

## Setup & Installation

```bash
cd backend

# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Seed database with 10 fake customers & sample inventory
python seed.py
```

---

## Running the Application

```bash
# Start FastAPI backend server on port 8000
uvicorn app.main:app --reload --port 8000
```

- **Swagger / OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Interactive ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## Running Automated Tests

Run the full pytest suite:

```bash
pytest tests/ -v
```

This verifies:
1. Deterministic balance computation directly in SQL ($\sum \text{credit} - \sum \text{payment}$).
2. Fuzzy matching thresholds (85% auto, 70-85% confirmation, <70% new customer).
3. LLM parsing validation, few-shot prompt parsing, and 1-attempt retry with zero-confidence fallback.
4. Inventory stock tracking and `low_stock` boolean flag.
5. WhatsApp deep link generation with URL-encoded polite Hinglish reminder templates.

---

## Environment Variables (Optional)

Override defaults via `.env` or system environment:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./hisabb.db` | SQLite database URI |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama service endpoint |
| `OLLAMA_MODEL` | `qwen2.5:3b` | Local LLM model tag |
| `WHISPER_MODEL_SIZE` | `base` | faster-whisper model size |
| `WHISPER_DEVICE` | `cpu` | Whisper compute device |
| `WHISPER_COMPUTE_TYPE`| `int8` | Quantization type |
