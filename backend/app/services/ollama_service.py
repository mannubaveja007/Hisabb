import json
import logging
import re
import requests
from typing import List, Optional
from app.config import settings
from app.schemas import LLMParseResult, LLMEntryExtraction

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an Indian retail store (Kirana) voice ledger entity extraction engine for Hisabb.
You parse spoken Hinglish, Punjabi, Hindi, or Indian English into structured transaction entries.

Entry types:
- 'credit': Customer takes goods on udhaar or balance owes to shopkeeper. (e.g., 'udhaar liya', 'baaki', 'khate me likho')
- 'payment': Customer pays money / clears dues. (e.g., 'jama kiye', 'de diye', 'paise diye', 'ada kiye', 'bhugtan')
- 'stock_in': Wholesale goods arrival / restock. (e.g., 'maal aaya', 'peti aayi', 'doodh aaya')
- 'stock_out': Wastage, damaged items, or cash sales stock deduction.

Guidelines:
1. Always output strict JSON matching the schema: {"entries": [...]}.
2. Amount must be a positive number. If no amount is explicitly said for payment/credit, estimate or 0.0.
3. Clean honorifics like "ji", "bhai", "sahab", "uncle" from the customer field if appropriate, but keep the core name intact.
4. Extract item, qty, unit if mentioned (e.g., 'packet', 'kilo', 'kg', 'ltr', 'bag', 'peti').
5. Convert number words in Hindi/Hinglish to numbers: ek=1, do=2, teen=3, chaar=4, paanch=5, sau=100, dedh=150, dhai=250, hazaar=1000.
6. Interpret "X ko/de diye/jama kiye" as a payment when money is mentioned. Interpret "X ne ... liya/udhaar/baaki" as credit. Never invent an amount: use 0.0 and confidence below 0.5 when it is not spoken.
7. Preserve Devanagari customer names and return one entry for every distinct customer/action in the utterance.

Few-Shot Examples:
User: "Sharma ji ne 2 kilo cheeni li, 90 rupaye baaki"
Output:
{
  "entries": [
    {
      "customer": "Sharma",
      "type": "credit",
      "item": "Cheeni",
      "qty": 2.0,
      "unit": "kilo",
      "amount": 90.0,
      "confidence": 0.95
    }
  ]
}

User: "Gupta ne 500 de diye"
Output:
{
  "entries": [
    {
      "customer": "Gupta",
      "type": "payment",
      "item": null,
      "qty": null,
      "unit": null,
      "amount": 500.0,
      "confidence": 0.98
    }
  ]
}

User: "Ramesh ne do packet doodh udhaar liya aur Suresh ne 500 rupaye jama kiye"
Output:
{
  "entries": [
    {
      "customer": "Ramesh",
      "type": "credit",
      "item": "Doodh",
      "qty": 2.0,
      "unit": "packet",
      "amount": 66.0,
      "confidence": 0.94
    },
    {
      "customer": "Suresh",
      "type": "payment",
      "item": null,
      "qty": null,
      "unit": null,
      "amount": 500.0,
      "confidence": 0.98
    }
  ]
}

User: "Gurpreet ton 200 rupaye jama hoye te 10 peti tel aaya"
Output:
{
  "entries": [
    {
      "customer": "Gurpreet",
      "type": "payment",
      "item": null,
      "qty": null,
      "unit": null,
      "amount": 200.0,
      "confidence": 0.95
    },
    {
      "customer": null,
      "type": "stock_in",
      "item": "Tel",
      "qty": 10.0,
      "unit": "peti",
      "amount": 0.0,
      "confidence": 0.92
    }
  ]
}
"""

def call_ollama(text: str) -> dict:
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "system": SYSTEM_PROMPT,
        "prompt": text,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.1
        }
    }
    headers = {}
    if settings.OLLAMA_API_KEY:
        headers["Authorization"] = f"Bearer {settings.OLLAMA_API_KEY}"

    response = requests.post(url, json=payload, headers=headers, timeout=45)
    response.raise_for_status()
    raw_response = response.json().get("response", "{}")
    return json.loads(raw_response)

_HINDI_NUMBERS = {
    "एक": 1.0, "दो": 2.0, "तीन": 3.0, "चार": 4.0, "पाँच": 5.0,
    "पांच": 5.0, "छह": 6.0, "सात": 7.0, "आठ": 8.0, "नौ": 9.0,
    "दस": 10.0, "ग्यारह": 11.0, "बारह": 12.0, "सौ": 100.0,
    "डेढ़": 1.5, "डेढ़": 1.5, "ढाई": 2.5, "साढ़े": 1.5, "साढ़े": 1.5,
}


def _number_from_text(value: str) -> Optional[float]:
    value = value.strip().lower()
    if value.isdigit():
        return float(value)
    if value in _HINDI_NUMBERS:
        return _HINDI_NUMBERS[value]
    match = re.search(r"(\d+(?:\.\d+)?)", value)
    return float(match.group(1)) if match else None


def _fallback_parse(text: str) -> List[LLMEntryExtraction]:
    """Best-effort parser for common short Hindi/Hinglish ledger commands."""
    cleaned = re.sub(r"[,।]", " ", text).strip()
    if not cleaned:
        return []

    is_payment = bool(re.search(r"(भुगतान|जमा|दिए|दिये|paid|payment|jama|diye|de diye)", cleaned, re.I))
    is_credit = bool(re.search(r"(उधार|बाकी|लिया|liya|udhaar|baaki)", cleaned, re.I))
    entry_type = "payment" if is_payment and not is_credit else "credit"

    amount = 0.0
    amount_match = re.search(
        r"(साढ़े|साढ़े)\s*सौ|((?:\d+(?:\.\d+)?)|(?:एक|दो|तीन|चार|पाँच|पांच|छह|सात|आठ|नौ|दस|सौ))\s*(?:रुपये|रुपए|रुपया|rs|rupees?)",
        cleaned,
        re.I,
    )
    if amount_match:
        if amount_match.group(1):
            amount = 150.0
        else:
            parsed_amount = _number_from_text(amount_match.group(2))
            amount = parsed_amount or 0.0
    elif is_payment:
        payment_amount = re.search(r"\b(\d+(?:\.\d+)?)\b", cleaned)
        if payment_amount:
            amount = float(payment_amount.group(1))

    qty = None
    unit = None
    qty_match = re.search(r"(\d+(?:\.\d+)?|एक|दो|तीन|चार|पाँच|पांच|पाँच|साढ़े|साढ़े|डेढ़|डेढ़|ढाई)\s*(किलो|किलोग्राम|kg|लीटर|लीटर|ltr|पैकेट|packet|पेटी|peti|बैग|bag)", cleaned, re.I)
    if qty_match:
        qty = _number_from_text(qty_match.group(1))
        unit = qty_match.group(2)
        if re.search(r"साढ़े|साढ़े", qty_match.group(1), re.I):
            qty = 1.5

    customer_match = re.match(        r"\s*([^,]+?)(?:\s+ने|\s+ne|\s+जी|\s+ji|\s+भाई|\s+bhai|\s+ton|\s+ko|,|$)", cleaned, re.I)
    customer = customer_match.group(1).strip() if customer_match else None
    customer = re.sub(r"\s+(जी|भाई|ji|bhai)$", "", customer or "", flags=re.I).strip() or None

    item = None
    if qty_match:
        remainder = cleaned[qty_match.end():]
        item_match = re.match(r"\s*([^,]+?)(?=\s+(?:\d|साढ़े|साढ़े|रुपये|रुपए|रुपया)|,|$)", remainder, re.I)
        if item_match:
            item = item_match.group(1).strip() or None

    if not (is_payment or is_credit or qty is not None or amount > 0):
        return []

    return [LLMEntryExtraction(
        customer=customer,
        type=entry_type,
        item=item,
        qty=qty,
        unit=unit,
        amount=amount,
        confidence=0.55,
    )]


def parse_with_ollama(text: str) -> List[LLMEntryExtraction]:
    try:
        data = call_ollama(text)
        validated = LLMParseResult(**data)
        if validated.entries:
            return validated.entries
    except Exception as error:
        logger.warning("Ollama extraction failed: %s", error)

    fallback_entries = _fallback_parse(text)
    if fallback_entries:
        logger.info("Using deterministic parser fallback for transcription")
    return fallback_entries
