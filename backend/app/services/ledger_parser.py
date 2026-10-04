import re
import unicodedata
from typing import List, Optional

from app.schemas import LLMEntryExtraction


_NUMBERS = {
    "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पाँच": 5, "पांच": 5,
    "पाच": 5, "छह": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
    "ग्यारह": 11, "बारह": 12, "बीस": 20, "पचास": 50,
    "ek": 1, "do": 2, "teen": 3, "chaar": 4, "paanch": 5,
    "panch": 5, "saat": 7, "das": 10,
    "डेढ़": 1.5, "डेढ़": 1.5, "dedh": 1.5, "ढाई": 2.5, "dhai": 2.5,
}
_SCALES = {"सौ": 100, "sau": 100, "हजार": 1000, "हज़ार": 1000, "hazaar": 1000}
_WORD = "(?:" + "|".join(sorted(map(re.escape, _NUMBERS), key=len, reverse=True)) + ")"
_SCALE = "(?:" + "|".join(_SCALES) + ")"
_BASE = rf"(?:\d+(?:\.\d+)?|{_WORD})"
_NUMBER = rf"(?:(?:साढ़े|साढ़े|saadhe)\s+{_BASE}(?:\s+{_SCALE})?|{_BASE}(?:\s+{_SCALE})?|{_SCALE})"
_CURRENCY = r"(?:रुपये|रुपए|रुपया|रूपये|रूपए|रूपे|रुपे|rupaye|rupay|rupees?|rs)"
_UNIT = r"(?:किलोग्राम|किलो|लीटर|पैकेट|पेटी|बैग|kilograms?|kilos?|kg|litres?|liters?|ltr|packets?|peti|bags?)"
_PAYMENT = r"(?:भुगतान|जमा|दिए|दिये|paid|payment|jama|diye)"
_CREDIT = r"(?:उधार|बाकी|लिया|liya|udhaar|udhar|baaki|baki)"
# Do not treat Devanagari combining marks as word boundaries (Python's \b does).
_LEFT = r"(?<![^\s])"
_RIGHT = r"(?=$|\s)"


def _number(value: str) -> Optional[float]:
    parts = value.split()
    scale = _SCALES.get(parts[-1], 1)
    if parts[-1] in _SCALES:
        parts.pop()
    half = bool(parts and parts[0] in ("साढ़े", "साढ़े", "saadhe"))
    if half:
        parts.pop(0)
    if not parts:
        return None if half else float(scale)
    if len(parts) != 1:
        return None
    base = _NUMBERS.get(parts[0])
    if base is None:
        try:
            base = float(parts[0])
        except ValueError:
            return None
    return (base + (0.5 if half else 0)) * scale


def parse_simple_entry(text: str) -> List[LLMEntryExtraction]:
    """Extract a single reviewable draft; leave complex commands to the model."""
    cleaned = unicodedata.normalize("NFC", text).lower()
    cleaned = re.sub(r"[,।!?]|\.(?!\d)", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if not cleaned or re.search(r"(?:^|\s)(?:aur|और|and|te)(?:\s|$)|[;\n]", text.lower()):
        return []
    if re.search(r"(?:^|\s)(?:stock|maal|aaya|आया|माल|waste|खराब)(?:\s|$)", cleaned):
        return []

    payment = re.search(_LEFT + _PAYMENT + _RIGHT, cleaned)
    credit = re.search(_LEFT + _CREDIT + _RIGHT, cleaned)
    if payment and credit:
        return []

    quantities = list(re.finditer(_LEFT + rf"(?P<number>{_NUMBER})\s*(?P<unit>{_UNIT})" + _RIGHT, cleaned))
    amounts = list(re.finditer(_LEFT + rf"(?P<number>{_NUMBER})\s*{_CURRENCY}" + _RIGHT, cleaned))
    if len(quantities) > 1 or len(amounts) > 1:
        return []
    quantity = quantities[0] if quantities else None
    amount_match = amounts[0] if amounts else None
    # Multiple unlabelled numbers must not silently become a single money value.
    if payment and not amount_match and not quantity:
        candidates = list(re.finditer(_LEFT + rf"(?P<number>{_NUMBER})" + _RIGHT, cleaned))
        if len(candidates) > 1:
            return []
        if len(candidates) == 1:
            amount_match = candidates[0]

    captured = [m for m in (quantity, amount_match) if m]
    for number in re.finditer(_LEFT + _NUMBER + _RIGHT, cleaned):
        if not any(m.start() <= number.start() and number.end() <= m.end() for m in captured):
            return []

    customer_match = re.match(r"(.+?)\s+(?:जी|ji|भाई|bhai|ने|ne|ton|ko)(?=$|\s)", cleaned)
    if customer_match:
        customer = customer_match.group(1).strip()
    else:
        boundaries = [m.start() for m in (quantity, amount_match, payment, credit) if m]
        customer = cleaned[:min(boundaries)].strip() if boundaries else ""
    if not customer or len(customer.split()) > 4 or re.search(r"\d", customer):
        return []
    # Preserve the original name's capitalization for the confirmation sheet.
    customer = text.strip()[:len(customer)]

    item = None
    if quantity:
        end = min([m.start() for m in (amount_match, payment, credit) if m and m.start() > quantity.end()] or [len(cleaned)])
        item = cleaned[quantity.end():end].strip()
        # This observed ASR error is a separator, not evidence of payment direction.
        item = re.split(r"\s+(?:वदार|li|लि|ली|लिया)(?=$|\s)", item)[0].strip() or None
    if not (payment or credit or (quantity and item)):
        return []

    amount = _number(amount_match.group("number")) if amount_match else None
    qty = _number(quantity.group("number")) if quantity else None
    if quantity and qty is None:
        return []
    return [LLMEntryExtraction(
        customer=customer,
        type="payment" if payment else "credit",
        item=item,
        qty=qty,
        unit=quantity.group("unit") if quantity else None,
        amount=amount or 0.0,
        confidence=0.55 if not (payment or credit) or not amount else 0.8,
    )]
