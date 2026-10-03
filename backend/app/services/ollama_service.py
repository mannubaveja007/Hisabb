import json
import logging
import requests
from typing import List
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

def parse_with_ollama(text: str) -> List[LLMEntryExtraction]:
    # Attempt 1
    try:
        data = call_ollama(text)
        validated = LLMParseResult(**data)
        return validated.entries
    except Exception as e1:
        logger.warning(f"Ollama extraction failed on attempt 1: {e1}. Retrying once...")
        # Retry once
        try:
            data = call_ollama(f"Please output strictly valid JSON conforming to the schema:\n{text}")
            validated = LLMParseResult(**data)
            return validated.entries
        except Exception as e2:
            logger.error(f"Ollama extraction failed on retry: {e2}. Returning no entries.")
            return []
