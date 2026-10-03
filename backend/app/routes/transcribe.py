from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import TranscribeResponse
from app.services.whisper_service import whisper_service

router = APIRouter(prefix="/api", tags=["Transcribe"])

@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    try:
        result = whisper_service.transcribe(file_bytes, file.filename)
        return TranscribeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
