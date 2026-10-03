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
        entries = parse_with_ollama("Sharma ji ne 2 kilo cheeni li, 90 rupaye baaki")
        assert len(entries) == 1
        assert entries[0].customer == "Sharma"
        assert entries[0].type == "credit"
        assert entries[0].amount == 90.0
        assert entries[0].qty == 2.0

def test_ollama_parser_invalid_json_fallback():
    # Simulate repeated invalid JSON from Ollama
    with patch("app.services.ollama_service.call_ollama", side_effect=Exception("Invalid JSON format")):
        entries = parse_with_ollama("Gibberish unparsable speech string")
        assert len(entries) == 1
        assert entries[0].confidence == 0.0
        assert entries[0].amount == 0.0
        assert entries[0].item == "Gibberish unparsable speech string"
