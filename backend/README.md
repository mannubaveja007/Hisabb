# Hisabb Backend

## Render deployment

The repository includes a root `render.yaml` Blueprint for this service. If configuring Render manually, use:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/health`

Set `CORS_ORIGINS` to the deployed frontend URL. Keep `DATABASE_URL` as SQLite for a simple demo, or provide a hosted database URL when durable storage is needed.
 & Static Server

Local-first, voice-driven credit ledger for Indian Kirana & Retail stores.

Serves the Next.js static PWA export at `/` and backend API endpoints under `/api`.

For the privacy-first local mode, run Ollama and Whisper on the same machine as this backend. Download the models once while online; after that, the ledger and voice processing can run without internet. A Render deployment is a hosted mode and should not be described as offline.

For a hosted Render deployment, use Ollama Cloud by setting `OLLAMA_BASE_URL=https://ollama.com`, `OLLAMA_API_KEY` to an Ollama API key, and `OLLAMA_MODEL` to a model available in that account. The backend sends the key only in the server-side Authorization header; it is never exposed to the frontend.

## Endpoints
- `POST /api/transcribe`: Ingests audio files via `faster-whisper` (base, int8 on CPU)
- `POST /api/parse`: Extracts structured ledger entries using Ollama (`qwen2.5:3b`) with fuzzy customer resolution
- `POST /api/entries`: Confirms and commits ledger entries to SQLite
- `GET /api/customers/balances`: Retrieves all customer credit/payment balances computed directly in SQL
- `GET /api/customers/{id}/history`: Gets customer detail and chronological transaction ledger
- `GET /api/inventory`: Lists inventory items with `low_stock` boolean flag
- `GET /api/summary/weekly`: Outstanding balances with pre-encoded WhatsApp deep links

## Running with HTTPS for Phone Microphone Access (mkcert)

Browsers require HTTPS for microphone permissions on remote mobile devices:

```bash
# 1. Install mkcert
brew install mkcert
mkcert -install

# 2. Generate local certificates (substitute your Wi-Fi LAN IP)
mkcert localhost 127.0.0.1 192.168.1.15

# 3. Launch uvicorn with SSL
uvicorn app.main:app --host 0.0.0.0 --port 8000 \
  --ssl-keyfile localhost+2-key.pem \
  --ssl-certfile localhost+2.pem
```

## Running Tests
```bash
pytest -p no:anchorpy tests/ -v
```
