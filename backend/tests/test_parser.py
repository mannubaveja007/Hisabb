import pytest
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base
from app.models import Customer
from app.services.fuzzy_service import match_customer
from app.services.ollama_service import parse_with_ollama

# In-memory SQLite for tests
@pytest.fixture
def test_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()

    # Seed test customers
    c1 = Customer(name="Ramesh Kumar", phone="9876543210")
    c2 = Customer(name="Suresh Verma", phone="9812345678")
    c3 = Customer(name="Anita Sharma", phone="9823456789")
    db.add_all([c1, c2, c3])
    db.commit()

    yield db
    db.close()

def test_fuzzy_match_exact_and_honorific(test_db):
    # Ramesh Kumar with honorific "Ramesh ji"
    match = match_customer(test_db, "Ramesh ji")
    assert match is not None
    assert match.name == "Ramesh Kumar"
    assert match.score >= 0.70

def test_fuzzy_match_high_confidence_auto(test_db):
    # Exact full match >= 85%
    match = match_customer(test_db, "Ramesh Kumar")
    assert match is not None
    assert match.score >= 0.85
    assert match.score == 1.0

def test_fuzzy_match_medium_confirmation(test_db):
    # Match with single name "Ramesh" (falls between 70% and 85%)
    match = match_customer(test_db, "Ramesh")
    assert match is not None
    assert match.name == "Ramesh Kumar"
    assert 0.70 <= match.score <= 0.85

def test_fuzzy_match_new_customer(test_db):
    # Completely unfamiliar customer name should return None (< 70 threshold)
    match = match_customer(test_db, "Balvinder Singh Sandhu")
    assert match is None

def test_ollama_parser_success():
    sample_response = {
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
    with patch("app.services.ollama_service.call_ollama", return_value=sample_response):
        entries = parse_with_ollama("Sharma ji ne 2 kilo cheeni li aur 90 rupaye baaki")
        assert len(entries) == 1
        assert entries[0].customer == "Sharma"
        assert entries[0].type == "credit"
        assert entries[0].amount == 90.0
        assert entries[0].qty == 2.0

def test_ollama_parser_invalid_json_fallback():
    # Simulate repeated invalid JSON from Ollama
    with patch("app.services.ollama_service.call_ollama", side_effect=Exception("Invalid JSON format")):
        entries = parse_with_ollama("Gibberish unparsable speech string")
        assert entries == []


@pytest.mark.parametrize("text,customer,qty,amount,entry_type", [
    ("शर्मा जी, पाच, किलो, चावल, वदार, पाचरूपे.", "शर्मा", 5, 5, "credit"),
    ("शर्मा जी पाँच किलो चावल सात सौ रुपये उधार", "शर्मा", 5, 700, "credit"),
    ("शर्मा जी साढ़े पाँच किलो चावल डेढ़ सौ रुपये उधार", "शर्मा", 5.5, 150, "credit"),
    ("शर्मा जी डेढ़ किलो चावल ढाई सौ रुपये उधार", "शर्मा", 1.5, 250, "credit"),
    ("शर्मा जी ५ किलो चावल ७०० रुपये उधार", "शर्मा", 5, 700, "credit"),
    ("Sharma ji 2.5 kilo rice 90.50 rupaye udhaar", "Sharma", 2.5, 90.5, "credit"),
    ("Gupta ne 500 de diye", "Gupta", None, 500, "payment"),
    ("Gupta paid 500", "Gupta", None, 500, "payment"),
    ("गुप्ता जी पांच सौ रुपये जमा", "गुप्ता", None, 500, "payment"),
    ("शर्मा जी पांच किलो चावल उधार", "शर्मा", 5, 0, "credit"),
    ("Ramesh Kumar, Udhar, panch sau", "Ramesh Kumar", None, 500, "credit"),
    ("Ramesh Kumar, Udhar, panch soo", "Ramesh Kumar", None, 500, "credit"),
    ("Ramesh Kumar, Udhar, 500", "Ramesh Kumar", None, 500, "credit"),
])
def test_simple_entries_skip_remote_model(text, customer, qty, amount, entry_type):
    with patch("app.services.ollama_service.call_ollama") as remote:
        entries = parse_with_ollama(text)
    remote.assert_not_called()
    assert len(entries) == 1
    assert (entries[0].customer, entries[0].qty, entries[0].amount, entries[0].type) == (customer, qty, amount, entry_type)


def test_exact_curl_returns_reviewable_draft(test_db):
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from app.database import get_db
    from app.routes.parse import router

    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: test_db
    with TestClient(app) as client, patch("app.services.ollama_service.call_ollama") as remote:
        response = client.post("/api/parse", json={"text": "शर्मा जी, पाच, किलो, चावल, वदार, पाचरूपे."})
    remote.assert_not_called()
    assert response.status_code == 200
    draft = response.json()["entries"][0]
    assert draft["customer"] == "शर्मा"
    assert draft["item"] == "चावल"
    assert draft["qty"] == 5
    assert draft["amount"] == 5
    assert draft["confidence"] == 0.55
    assert test_db.query(Customer).count() == 3


@pytest.mark.parametrize("text", [
    "Gupta paid 500 and Ramesh paid 200",
    "शर्मा जी दो किलो चावल और पांच किलो आटा सात सौ रुपये उधार",
    "Gupta paid 500 200",
    "शर्मा जी पांच किलो चावल सात सौ पचास रुपये उधार",
    "Gupta ne 500 रुपये उधार जमा",
    "माल आया 10 किलो चावल",
    "random conversation",
])
def test_complex_or_ambiguous_input_is_not_guessed(text):
    from app.services.ledger_parser import parse_simple_entry
    assert parse_simple_entry(text) == []


def test_model_timeout_is_short_and_not_retried():
    import requests
    with patch("app.services.ollama_service.requests.post", side_effect=requests.Timeout) as post:
        assert parse_with_ollama("unrecognized complex instruction") == []
    post.assert_called_once()
    assert post.call_args.kwargs["timeout"] == (3, 8)
