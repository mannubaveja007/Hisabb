from typing import Optional, List
from rapidfuzz import fuzz
from unidecode import unidecode
import re
from sqlalchemy.orm import Session
from app.models import Customer
from app.schemas import CustomerMatch

def is_devanagari(text: str) -> bool:
    return any("\u0900" <= ch <= "\u097F" for ch in text)


def devanagari_to_latin(text: str) -> str:
    """Accurately transliterate Devanagari names to clean Latin/English script with schwa deletion."""
    consonants = {
        'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
        'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
        'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
        'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
        'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
        'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
        'ष': 'sh', 'स': 's', 'ह': 'h', 'क़': 'q', 'ख़': 'kh',
        'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f'
    }
    vowels = {
        'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
        'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au'
    }
    matras = {
        'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u',
        'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
        'ं': 'n', 'ँ': 'n', 'ः': 'h'
    }
    halant = '्'

    words = text.split()
    res_words = []
    for w in words:
        out = []
        n = len(w)
        i = 0
        while i < n:
            ch = w[i]
            if i + 1 < n and w[i:i+2] in consonants:
                ch = w[i:i+2]
                i += 1
            if ch in vowels:
                out.append(vowels[ch])
            elif ch in consonants:
                c_str = consonants[ch]
                if i + 1 < n:
                    next_ch = w[i+1]
                    if next_ch == halant:
                        out.append(c_str)
                        i += 1
                    elif next_ch in matras:
                        out.append(c_str + matras[next_ch])
                        i += 1
                    else:
                        out.append(c_str + 'a')
                else:
                    out.append(c_str)
            elif ch in matras:
                out.append(matras[ch])
            else:
                out.append(ch)
            i += 1
        res_words.append(''.join(out).title())
    return ' '.join(res_words)


COMMON_NAMES = {
    'सिद्धू': 'Sidhu', 'सिधु': 'Sidhu', 'मुसे': 'Moose', 'मूसे': 'Moose',
    'वाला': 'Wala', 'मन्नू': 'Mannu', 'मनू': 'Mannu', 'बवेजा': 'Baveja',
    'शर्मा': 'Sharma', 'वर्मा': 'Verma', 'गुप्ता': 'Gupta', 'सिंह': 'Singh',
    'कौर': 'Kaur', 'कुमार': 'Kumar', 'देवी': 'Devi', 'प्रसाद': 'Prasad',
    'चावला': 'Chawla', 'इमरान': 'Imran', 'सुरेश': 'Suresh', 'रमेश': 'Ramesh',
    'अनीता': 'Anita', 'विकास': 'Vikas', 'सुनीता': 'Sunita', 'पूजा': 'Pooja',
    'मनप्रीत': 'Manpreet', 'हरप्रीत': 'Harpreet', 'राजिंदर': 'Rajinder'
}


def transliterate_name(text: Optional[str]) -> str:
    if not text:
        return ""
    if not is_devanagari(text):
        return text.strip()
    words = text.split()
    out = []
    for w in words:
        clean_w = w.strip(',।!?')
        if clean_w in COMMON_NAMES:
            out.append(COMMON_NAMES[clean_w])
        else:
            out.append(devanagari_to_latin(clean_w))
    return ' '.join(out)


def _normalize_name(value: str) -> str:
    transliterated = transliterate_name(value) if is_devanagari(value) else unidecode(value)
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
            calc_score = (ts_ratio + set_ratio) / 2.0


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
