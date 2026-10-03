from typing import Optional, List
from rapidfuzz import fuzz
from unidecode import unidecode
import re
from sqlalchemy.orm import Session
from app.models import Customer
from app.schemas import CustomerMatch

def _normalize_name(value: str) -> str:
    transliterated = unidecode(value)
    normalized = re.sub(r"[^a-z0-9 ]+", " ", transliterated.lower())
    normalized = re.sub(r"\s+", " ", normalized).strip()
    for suffix in (" ji", " sahab", " bhai", " bhaji", " uncle", " sir"):
        if normalized.endswith(suffix):
            normalized = normalized[:-len(suffix)].strip()
            break
    return normalized


def match_customer(db: Session, raw_name: Optional[str]) -> Optional[CustomerMatch]:
    if not raw_name or not raw_name.strip():
        return None

    query_name = _normalize_name(raw_name)

    customers: List[Customer] = db.query(Customer).all()
    if not customers:
        return None

    best_match: Optional[Customer] = None
    best_score = 0.0

    for c in customers:
        c_name_lower = _normalize_name(c.name)

        # Full-name containment is a strong match for spoken first/last names.
        if query_name == c_name_lower:
            calc_score = 100.0
        else:
            ts_ratio = fuzz.token_sort_ratio(query_name, c_name_lower)
            set_ratio = fuzz.token_set_ratio(query_name, c_name_lower)
            partial_ratio = fuzz.partial_token_set_ratio(query_name, c_name_lower)
            calc_score = max((ts_ratio + set_ratio) / 2.0, partial_ratio)

        if calc_score > best_score:
            best_score = calc_score
            best_match = c

    # Threshold: >= 70% returns match (>= 85% is auto, 70-85% is needs confirmation)
    if best_match and best_score >= 70.0:
        return CustomerMatch(
            id=best_match.id,
            name=best_match.name,
            phone=best_match.phone,
            score=round(best_score / 100.0, 2)
        )

    # Below 70% is considered a new customer
    return None
