import json
import logging
import requests
from typing import List
from app.services.ledger_parser import parse_simple_entry
from app.config import settings
from app.schemas import LLMParseResult, LLMEntryExtraction

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an Indian retail store (Kirana) voice ledger entity extraction engine for Hisabb.
You parse spoken Hinglish, Punjabi, Hindi, or Indian English into structured transaction entries.

Entry types:
- 'credit': Customer takes goods on udhaar or balance owes to shopkeeper. (e.g., 'udhaar', 'udaar', 'dar', 'baaki', 'khate me likho', 'उधार', 'उदार', 'दार').
- 'payment': Customer pays money / clears dues. (e.g., 'jama kiye', 'de diye', 'paise diye', 'ada kiye', 'bhugtan', 'chukta'). NOTE: 'udhaar'/'udaar'/'दार' is strictly credit, NEVER payment.
- 'stock_in': Wholesale goods arrival / restock. (e.g., 'maal aaya', 'peti aayi', 'doodh aaya')
- 'stock_out': Wastage, damaged items, or cash sales stock deduction.

Guidelines:
1. Always output strict JSON matching the schema: {"entries": [...]}.
2. Never estimate amounts. Use 0.0 and confidence below 0.5 when a monetary amount is missing or unclear. Quantity is not money.
3. Clean honorifics like "ji", "bhai", "sahab", "uncle" from the customer field if appropriate, but keep the core name (both first and last name intact, e.g. 'Mannu Baveja', 'मन्नू बवेजा'). Never truncate the name to just the surname or last syllable.
4. Extract item, qty, unit if mentioned (e.g., 'packet', 'kilo', 'kg', 'ltr', 'bag', 'peti').
5. Convert number words in Hindi/Hinglish: ek=1, do=2, teen=3, chaar=4, paanch/panch=5, sau=100, dedh=1.5, dhai=2.5, hazaar=1000. (e.g., '5 hazaar' or 'panch hazaar' = 5000.0, dedh sau=150, dhai sau=250).
6. Interpret "X ko/de diye/jama kiye" as a payment when money is mentioned. Interpret "X udhaar/udaar/baaki" or "X ne liya" as credit. Never invent an amount: use 0.0 and confidence below 0.5 when it is not spoken.
7. Preserve original customer names (English or Devanagari) and return one entry for every distinct customer/action in the utterance.

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
      "amount": 0.0,
      "confidence": 0.4
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
    model_name = settings.OLLAMA_MODEL
    headers = {}
    if settings.OLLAMA_API_KEY:
        headers["Authorization"] = f"Bearer {settings.OLLAMA_API_KEY}"

    payload = {
        "model": model_name,
        "system": SYSTEM_PROMPT,
        "prompt": text,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.1
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=(3, 8))
        if response.status_code == 404:
            # Model not found; check if any model is available on Ollama instance
            tags_resp = requests.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags", headers=headers, timeout=2)
            if tags_resp.status_code == 200:
                models = [m.get("name") for m in tags_resp.json().get("models", []) if m.get("name")]
                if models and models[0] != model_name:
                    payload["model"] = models[0]
                    response = requests.post(url, json=payload, headers=headers, timeout=(3, 8))
        response.raise_for_status()
        raw_response = response.json().get("response", "{}")
        return json.loads(raw_response)
    except Exception:
        raise

def parse_with_ollama(text: str) -> List[LLMEntryExtraction]:
    local_entries = parse_simple_entry(text)
    if local_entries:
        return local_entries

    try:
        data = call_ollama(text)
        return LLMParseResult(**data).entries
    except Exception as error:
        logger.warning("Ollama extraction failed: %s", error)
        return []
