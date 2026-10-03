import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db
from app.models import Customer, Item, Entry

@pytest.fixture
def client_and_db():
    # Using StaticPool and check_same_thread=False ensures in-memory SQLite tables persist across TestClient threads
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    yield client, db

    db.close()
    app.dependency_overrides.clear()

def test_balance_computation_in_sql(client_and_db):
    client, db = client_and_db

    # Create customer
    customer = Customer(name="Ramesh Kumar", phone="9876543210")
    db.add(customer)
    db.commit()

    # Add 2 credit entries and 1 payment entry
    # Credit 1: ₹300, Credit 2: ₹700 (Total credit: ₹1000)
    # Payment 1: ₹400 (Total paid: ₹400)
    # Expected Net Balance = ₹600.0
    e1 = Entry(customer_id=customer.id, type="credit", amount=300.0)
    e2 = Entry(customer_id=customer.id, type="credit", amount=700.0)
    e3 = Entry(customer_id=customer.id, type="payment", amount=400.0)
    db.add_all([e1, e2, e3])
    db.commit()

    response = client.get("/api/customers/balances")
    assert response.status_code == 200
    data = response.json()
    assert len(data["customers"]) == 1
    cust_data = data["customers"][0]
    assert cust_data["id"] == customer.id
    assert cust_data["total_credit"] == 1000.0
    assert cust_data["total_paid"] == 400.0
    assert cust_data["balance"] == 600.0

    # Test customer history endpoint
    hist_response = client.get(f"/api/customers/{customer.id}/history")
    assert hist_response.status_code == 200
    hist_data = hist_response.json()
    assert hist_data["customer"]["balance"] == 600.0
    assert len(hist_data["history"]) == 3

def test_inventory_stock_and_low_stock_flag(client_and_db):
    client, db = client_and_db

    # Min stock = 10
    item = Item(name="Amul Doodh", unit="packet", min_stock_threshold=10.0)
    db.add(item)
    db.commit()

    # Stock in: 15 packets
    db.add(Entry(type="stock_in", item_id=item.id, qty=15.0, amount=450.0))
    # Customer Udhaar: 7 packets
    db.add(Entry(type="credit", item_id=item.id, qty=7.0, amount=210.0))
    db.commit()

    # Current stock = 15 - 7 = 8 packets (<= min_stock 10 => low_stock: true)
    response = client.get("/api/inventory")
    assert response.status_code == 200
    inv = response.json()["items"]
    assert len(inv) == 1
    assert inv[0]["current_stock"] == 8.0
    assert inv[0]["low_stock"] is True

def test_weekly_summary_and_wa_link(client_and_db):
    client, db = client_and_db

    cust1 = Customer(name="Ramesh Kumar", phone="9876543210")
    cust2 = Customer(name="Suresh Verma", phone="9812345678")
    db.add_all([cust1, cust2])
    db.commit()

    # Cust 1 owes ₹750
    db.add(Entry(customer_id=cust1.id, type="credit", amount=750.0))
    # Cust 2 owes ₹0 (₹500 credit - ₹500 payment)
    db.add(Entry(customer_id=cust2.id, type="credit", amount=500.0))
    db.add(Entry(customer_id=cust2.id, type="payment", amount=500.0))
    db.commit()

    response = client.get("/api/summary/weekly")
    assert response.status_code == 200
    data = response.json()

    # Only cust1 with balance > 0 should appear
    assert len(data) == 1
    item = data[0]
    assert item["customer"]["id"] == cust1.id
    assert item["balance"] == 750.0
    assert "Namaste Ramesh Kumar ji" in item["reminder_text"]
    assert "750.00" in item["reminder_text"]
    assert "https://wa.me/919876543210?text=" in item["wa_link"]
