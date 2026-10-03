import os
import tempfile
from faster_whisper import WhisperModel
from app.config import settings

class WhisperService:
    def __init__(self):
        self.model = None

    def _get_model(self):
        if self.model is None:
            self.model = WhisperModel(
                settings.WHISPER_MODEL_SIZE,
                device=settings.WHISPER_DEVICE,
                compute_type=settings.WHISPER_COMPUTE_TYPE
            )
        return self.model

    def transcribe(self, file_bytes: bytes, filename: str) -> dict:
        ext = os.path.splitext(filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            model = self._get_model()
            # Auto-detect language, prioritize hi/pa/en context
            segments, info = model.transcribe(
                tmp_path,
                beam_size=5,
                language=None, # auto detect
                initial_prompt="Hindi, Punjabi, and Indian English store transactions. Udhaar, jama, khata, rupaye, packets."
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
