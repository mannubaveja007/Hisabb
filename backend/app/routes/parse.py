from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ParseRequest, ParseResponse, ParsedDraftEntry
from app.services.ollama_service import parse_with_ollama
from app.services.fuzzy_service import match_customer, transliterate_name, is_devanagari

router = APIRouter(prefix="/api", tags=["Parse"])

@router.post("/parse", response_model=ParseResponse)
def parse_voice_text(request: ParseRequest, db: Session = Depends(get_db)):
    if not request.text.strip():
        raise HTTPException(status_code=422, detail="No transcription text was provided")

    llm_entries = parse_with_ollama(request.text)
    if not llm_entries:
        raise HTTPException(status_code=422, detail="Could not understand this entry. Please repeat the customer, item, amount and credit/payment, or add it manually.")

    response_entries = []

    for item in llm_entries:
        cust_match = match_customer(db, item.customer) if item.customer else None
        cust_english = None
        if item.customer:
            if cust_match and cust_match.score >= 0.85:
                cust_english = cust_match.name
            else:
                cust_english = transliterate_name(item.customer)

        response_entries.append(
            ParsedDraftEntry(
                customer=item.customer,
                type=item.type,
                item=item.item,
                qty=item.qty,
                unit=item.unit,
                amount=item.amount,
                confidence=item.confidence,
                customer_match=cust_match,
                customer_english=cust_english
            )
        )

    return ParseResponse(entries=response_entries)
