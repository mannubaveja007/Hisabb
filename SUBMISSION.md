# Hisabb — Open Innovation Weekend Submission

## Built for a friend

Hisabb was built for **[FRIEND_NAME]**, a kirana/shopkeeper who keeps customer credit in memory, paper notes, or a general-purpose app that is difficult to use while serving customers.

The specific problem is simple: when a customer says, “Sharma ji ne do packet doodh udhaar liya,” the shopkeeper should be able to speak once and get a clear, editable ledger entry without typing, switching languages, or sending a private voice recording to a closed AI service.

## What Hisabb does

Hisabb is a voice-first credit ledger for small Indian retail shops. A shopkeeper can:

- Record a Hindi, Hinglish, Punjabi, or Indian-English voice note.
- Transcribe it with Whisper.
- Extract customer, transaction type, item, quantity, and amount.
- Review and correct the draft before saving it.
- Track balances, payment history, inventory, and WhatsApp reminders.
- Add an entry manually when speaking is not convenient.

## Why open innovation matters

The important AI pieces are open and replaceable:

- `faster-whisper` runs speech-to-text locally.
- Ollama runs the open-weight `qwen2.5:3b` model locally for structured extraction.
- The model name, Whisper settings, and Ollama URL are configuration values, not hard-coded vendor dependencies.
- The ledger can run on a laptop or local network without sending voice recordings, customer names, or balances to a closed AI provider.

This worked better than a closed API for this use case because the data is sensitive, the shopkeeper may have unreliable internet, and the workflow needs Indian-language prompts that can be adjusted locally. A closed model may be convenient, but the local setup gives control over privacy, cost, model choice, and behavior.

## Offline and hosted modes

Hisabb has two honest operating modes:

### Local/offline mode

After downloading the Python packages, Whisper model, and Ollama model once, the app can run on a laptop or local Wi-Fi network without internet access. The phone connects to the local Hisabb server. This is the privacy-first mode.

### Hosted demo mode

The frontend can be hosted on Vercel and the backend on Render. That mode is convenient for sharing, but it is not offline and may have hosting limits or costs. The hosted deployment is separate from the local-first design; it does not change which AI components power the app.

## What we learned

Open components made it possible to build around the shopkeeper’s real workflow instead of designing around an external API. We could tune the parser prompt for Hindi/Hinglish phrases, keep the confirmation step in our control, and make the system understandable enough to debug when speech recognition is imperfect.

## Build process

Optional DevRelay session: **[DEVRELAY_SESSION_LINK]**

The project includes the frontend, FastAPI backend, local model configuration, seed data, parser tests, and Render deployment instructions.

## Handoff / feedback

After handing Hisabb to **[FRIEND_NAME]**, replace this section with what they actually said:

> “[FRIEND_FEEDBACK]”

The most important validation is whether the person can record a real transaction, understand the confirmation, and trust the resulting balance without needing technical help.
