import os
import tempfile
from app.config import settings

# Fix compatibility between faster-whisper and newer PyAV (av >= 14/15/19)
# where metadata_errors argument was removed from av.open()
try:
    import av
    _orig_av_open = av.open

    def _safe_av_open(*args, **kwargs):
        kwargs.pop("metadata_errors", None)
        return _orig_av_open(*args, **kwargs)

    av.open = _safe_av_open
    try:
        import faster_whisper.audio as _fwa
        _fwa.av.open = _safe_av_open
    except Exception:
        pass
except Exception:
    pass

from faster_whisper import WhisperModel

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
            segments, info = model.transcribe(
                tmp_path,
                beam_size=5,
                language=settings.WHISPER_LANGUAGE or None,
                task="transcribe",
                condition_on_previous_text=True,
                initial_prompt="किराना दुकान का हिसाब। शर्मा जी, अनीता, गुप्ता, उधार, जमा, बाकी, रुपये, किलो, पैकेट। Hindi and Hinglish customer names and amounts."
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
