from typing import Optional, List, Tuple
from rapidfuzz import process, fuzz
from sqlalchemy.orm import Session
from app.models import Customer
from app.schemas import CustomerMatch

def match_customer(db: Session, raw_name: Optional[str]) -> Optional[CustomerMatch]:
    if not raw_name or not raw_name.strip():
        return None

    query_name = raw_name.strip().lower()
    # Normalize common honorifics
    query_name = (
        query_name.replace(" ji", "")
        .replace(" sahab", "")
        .replace(" bhai", "")
        .replace(" bhaji", "")
        .replace(" uncle", "")
        .strip()
    )

    customers: List[Customer] = db.query(Customer).all()
    if not customers:
        return None

    customer_dict = {c.id: c for c in customers}
    names = [c.name for c in customers]

    # Use token_sort_ratio for Indian names order variations
    result = process.extractOne(query_name, names, scorer=fuzz.token_sort_ratio)
    if not result:
        return None

    matched_name, score, index = result

    # rapidfuzz score is 0 - 100
    if score >= 70.0:
        matched_cust = customers[index]
        return CustomerMatch(
            id=matched_cust.id,
            name=matched_cust.name,
            phone=matched_cust.phone,
            score=round(score / 100.0, 2)
        )

    # Below 70 indicates a new customer
    return None
