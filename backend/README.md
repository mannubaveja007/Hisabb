# Hisabb Backend & Static Server

Local-first, voice-driven credit ledger for Indian Kirana & Retail stores.

Serves the Next.js static PWA export at `/` and backend API endpoints under `/api`.

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
