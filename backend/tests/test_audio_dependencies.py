import io
import wave

import av
import numpy as np
from faster_whisper.audio import decode_audio


def test_whisper_decodes_wav_without_metadata_errors():
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(16000)
        audio.writeframes(b"\x00\x00" * 16000)
    buffer.seek(0)

    decoded = decode_audio(buffer)

    assert decoded.shape == (16000,)
    assert np.isfinite(decoded).all()


def test_whisper_decodes_browser_webm_opus():
    buffer = io.BytesIO()
    with av.open(buffer, "w", format="webm") as container:
        stream = container.add_stream("libopus", rate=48000)
        stream.layout = "mono"
        frame = av.AudioFrame.from_ndarray(
            np.zeros((1, 48000), dtype=np.int16), format="s16", layout="mono"
        )
        frame.sample_rate = 48000
        for packet in stream.encode(frame):
            container.mux(packet)
        for packet in stream.encode(None):
            container.mux(packet)
    buffer.seek(0)

    decoded = decode_audio(buffer)

    assert 15900 <= len(decoded) <= 16100
    assert np.isfinite(decoded).all()


def test_service_does_not_patch_global_audio_decoder():
    original_open = av.open
    from app.services.whisper_service import WhisperService

    assert av.open is original_open
    assert WhisperService().model is None
