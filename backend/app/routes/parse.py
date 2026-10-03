from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ParseRequest, ParseResponse, ParsedDraftEntry
from app.services.ollama_service import parse_with_ollama
from app.services.fuzzy_service import match_customer

router = APIRouter(prefix="/api", tags=["Parse"])

@router.post("/parse", response_model=ParseResponse)
def parse_voice_text(request: ParseRequest, db: Session = Depends(get_db)):
    if not request.text.strip():
        raise HTTPException(status_code=422, detail="No transcription text was provided")

    llm_entries = parse_with_ollama(request.text)
    if not llm_entries:
        raise HTTPException(status_code=422, detail="Could not confidently parse a ledger entry")

    response_entries = []

    for item in llm_entries:
        cust_match = match_customer(db, item.customer) if item.customer else None
        response_entries.append(
            ParsedDraftEntry(
                customer=item.customer,
                type=item.type,
                item=item.item,
                qty=item.qty,
                unit=item.unit,
                amount=item.amount,
                confidence=item.confidence,
                customer_match=cust_match
            )
        )

    return ParseResponse(entries=response_entries)
