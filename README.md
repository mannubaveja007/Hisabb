# Hisabb (बोल के हिसाब)

Local-first, voice-driven credit ledger for Indian Kirana & Retail stores.

Designed for non-technical shopkeepers with a warm neutral palette, large tactile touch targets, high contrast, and zero typing. Single-process architecture: FastAPI serves the exported Next.js PWA static bundle at `/` while running API endpoints at `/api/`.

Hisabb has two modes:

- **Local/offline mode:** after the Whisper and Ollama models are downloaded once, voice processing and ledger data can stay on a laptop or local Wi-Fi network without internet access.
- **Hosted demo mode:** the frontend may run on Vercel and the backend on Render for sharing. This mode requires network access and may have hosting limits; it is not the offline mode.

See [`SUBMISSION.md`](./SUBMISSION.md) for the open-innovation explanation and weekend-project submission draft.

---

## Architecture Overview

```
                                 ┌──────────────────────────────────────────────┐
                                 │       Hisabb Server (:8000)                  │
                                 │                                              │
[ Mobile PWA / Browser ] ───────►│  /            ──► Next.js Static Export (out)│
                                 │  /api/transcribe ──► faster-whisper (int8)   │
                                 │  /api/parse      ──► Ollama (qwen2.5:3b)     │
                                 │  /api/entries    ──► SQLite (hisabb.db)      │
                                 │  /api/customers  ──► SQL Ledger Aggregation  │
                                 │  /api/summary    ──► WhatsApp wa.me links    │
                                 └──────────────────────────────────────────────┘
```

---

## Quickstart

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **pnpm**
- **Ollama** running locally with `qwen2.5:3b`:
  ```bash
  ollama pull qwen2.5:3b
  ollama serve
  ```

### 2. Build Frontend (Static Export)
```bash
cd frontend
pnpm install
pnpm run build
```
This produces the production static build in `frontend/out`.

### 3. Setup Backend & Seed Database
```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
```

### 4. Run Hisabb (Single Process on Port 8000)
```bash
uvicorn app.main:app --reload --port 8000
```
Open [http://localhost:8000](http://localhost:8000) on your desktop or phone to use the app.

---

## Mobile Phone Mic Access via HTTPS (`mkcert`)

Mobile browsers (Chrome / Safari / Firefox on Android & iOS) require a secure context (**HTTPS**) to allow microphone recording (`navigator.mediaDevices.getUserMedia`) when accessed over your local Wi-Fi network.

To run Hisabb with HTTPS on your local network:

### Step 1: Install `mkcert` and trust the local CA
```bash
# On macOS
brew install mkcert
mkcert -install

# On Linux
sudo apt install libnss3-tools
# Install mkcert from github.com/FiloSottile/mkcert/releases
mkcert -install
```

### Step 2: Generate SSL Certificates for Localhost & Your LAN IP
Find your local IP address (e.g., `192.168.1.15` via `ifconfig` or `ip a`), then run:
```bash
cd backend
mkcert localhost 127.0.0.1 192.168.1.15
```
This generates two files:
- `localhost+2-key.pem` (Private Key)
- `localhost+2.pem` (Certificate)

### Step 3: Start FastAPI with SSL Enabled
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 \
  --ssl-keyfile localhost+2-key.pem \
  --ssl-certfile localhost+2.pem
```

Now open `https://192.168.1.15:8000` on your phone connected to the same Wi-Fi. The phone will allow full microphone access and prompt you to install Hisabb as a standalone PWA on your home screen.

---

## Running Automated Tests

```bash
cd backend
pytest -p no:anchorpy tests/ -v
```

All 9 tests verify:
- Deterministic credit ledger calculations directly in SQL ($\sum \text{credit} - \sum \text{payment}$)
- Low-stock inventory alert threshold triggers
- WhatsApp click-to-chat `wa.me` links with URL-encoded polite Hinglish reminder templates
- Customer fuzzy matching with RapidFuzz (auto match $\ge 85\%$, confirmation $70-85\%$, new customer $< 70\%$)
- Ollama few-shot parsing with Pydantic validation and 1-attempt retry fallback
