import os
import tempfile
from app.config import settings

from faster_whisper import WhisperModel

def build_initial_prompt() -> str:
    base_prompt = (
        "किराना दुकान का खाता हिसाब। मन्नू बवेजा, Mannu Baveja, रमेश कुमार, Ramesh Kumar, "
        "सुरेश, अनीता, गुप्ता जी, 5000 पांच हज़ार रुपये, 500 पाँच सौ, 200 दो सौ, 100 एक सौ, "
        "1000 एक हज़ार, उधार, udhaar, जमा, jama, बाकी, baaki, नकद, packet, kilo, kg."
    )
    try:
        from app.database import SessionLocal
        from app.models import Customer
        db = SessionLocal()
        customers = db.query(Customer.name).order_by(Customer.id.desc()).limit(15).all()
        db.close()
        if customers:
            names = [c[0] for c in customers if c[0]]
            if names:
                return f"{base_prompt} ग्राहक: {', '.join(names[:10])}."
    except Exception:
        pass
    return base_prompt

class WhisperService:
    def __init__(self):
        self.model = None
        self._current_model_size = None

    def _get_model(self):
        if self.model is None or self._current_model_size != settings.WHISPER_MODEL_SIZE:
            self.model = WhisperModel(
                settings.WHISPER_MODEL_SIZE,
                device=settings.WHISPER_DEVICE,
                compute_type=settings.WHISPER_COMPUTE_TYPE
            )
            self._current_model_size = settings.WHISPER_MODEL_SIZE
        return self.model

    def transcribe(self, file_bytes: bytes, filename: str) -> dict:
        prompt = build_initial_prompt()

        # 1. Fast Groq Cloud Whisper if GROQ_API_KEY is configured (0.2s latency, 0 server RAM)
        groq_key = getattr(settings, "GROQ_API_KEY", "") or os.getenv("GROQ_API_KEY", "")
        if groq_key.strip():
            try:
                import requests
                url = "https://api.groq.com/openai/v1/audio/transcriptions"
                headers = {"Authorization": f"Bearer {groq_key.strip()}"}
                files = {"file": (filename or "audio.wav", file_bytes, "audio/wav")}
                data = {
                    "model": "whisper-large-v3-turbo",
                    "temperature": 0.0,
                    "prompt": prompt,
                    "response_format": "verbose_json"
                }
                resp = requests.post(url, headers=headers, files=files, data=data, timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "text": data.get("text", "").strip(),
                        "language": data.get("language", "hi")
                    }
            except Exception:
                pass  # Fall back to local faster-whisper

        # 2. Local faster-whisper
        ext = os.path.splitext(filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            model = self._get_model()
            segments, info = model.transcribe(
                tmp_path,
                beam_size=5,
                language=settings.WHISPER_LANGUAGE or None,
                task=settings.WHISPER_TASK or "translate",
                condition_on_previous_text=True,
                initial_prompt=prompt
            )
            full_text = " ".join([segment.text.strip() for segment in segments]).strip()
            detected_lang = info.language if info and info.language else "hi"
            return {
                "text": full_text,
                "language": detected_lang
            }
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

whisper_service = WhisperService()
