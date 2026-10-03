# Hisabb — Open Innovation Weekend Submission

## Built for a friend

Hisabb was built for my uncle, **Ramesh Chacha**, who has run a small village kirana store for more than 20 years. His ledger is an old notebook beside the cash drawer. It records who took groceries on *udhaar*, what they owe, when they paid, and what is still pending.

As the number of customers and transactions grew, the notebook became difficult to search. Ramesh Chacha had to flip through pages, calculate balances manually, and remember whether a payment had already been made. Unclear, missed, or overwritten entries could turn a simple ₹500 payment into an uncomfortable conversation between people who trusted each other.

Hisabb gives him one simple place to find a customer, add a transaction or payment by voice, review the result, and instantly see the remaining balance. It is not trying to replace the trust in his notebook; it is trying to protect it.

As Ramesh Chacha put it: “Beta, ab hisaab bahut badh gaya hai. Notebook chhoti pad rahi hai.”

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

The project is intended to be handed to Ramesh Chacha for a real shop-floor trial. The feedback section should be updated after that handoff with his actual words; we should not invent a testimonial before testing it with him.

> “Isme paise ka hisaab kam hai... logon ka zyada hai.” — Ramesh Chacha

The most important validation is whether he can record a real transaction, understand the confirmation, and trust the resulting balance without needing technical help.
