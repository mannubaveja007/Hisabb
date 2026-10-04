"""
Database seed script with realistic Indian Kirana customers, stock, and ledger transactions.
Matches the design mockup with real balances, items, and humanized dates.
"""
from datetime import datetime, timedelta
from app.database import SessionLocal, Base, engine
from app.models import Customer, Item, Entry

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for clean seed
    db.query(Entry).delete()
    db.query(Item).delete()
    db.query(Customer).delete()
    db.commit()

    now = datetime.utcnow()

    # 1. Retail Customers matching design aesthetic
    customers_data = [
        {"name": "Sharma Ji", "phone": "9876543210"},       # ₹700 balance (Chawal)
        {"name": "Anita Devi", "phone": "9823456789"},      # ₹2,400 balance (Dal)
        {"name": "Raju Bhai", "phone": "9834567890"},       # ₹1,800 balance (Tel)
        {"name": "Kiran Store", "phone": "9845678901"},     # ₹950 balance (Atta & Sugar)
        {"name": "Suresh Verma", "phone": "9812345678"},    # ₹0 balance (Milk)
        {"name": "Vikas Chawla", "phone": "9878901234"},    # ₹320 balance (Salt)
        {"name": "Mannu Baveja", "phone": "9999999999"},    # ₹5,000 balance
        {"name": "Harpreet Kaur", "phone": "9867890123"},   # ₹180 balance (Biscuit)
        {"name": "Mohammad Imran", "phone": "9890123456"},  # ₹420 balance (Masala)
        {"name": "Sunita Sharma", "phone": "9889012345"},   # ₹850 balance (Ghee)
    ]

    cust_map = {}
    for c in customers_data:
        cust = Customer(name=c["name"], phone=c["phone"])
        db.add(cust)
        cust_map[c["name"]] = cust
    db.commit()

    # 2. Inventory Items
    items_data = [
        {"name": "Rice 5kg (Chawal)", "unit": "bag", "min_stock_threshold": 10.0},
        {"name": "Flour 5kg (Atta)", "unit": "bag", "min_stock_threshold": 5.0},
        {"name": "Sugar 1kg (Cheeni)", "unit": "kg", "min_stock_threshold": 15.0},
        {"name": "Tata Salt 1kg (Namak)", "unit": "packet", "min_stock_threshold": 8.0},
        {"name": "Mustard Oil 1L (Sarson Tel)", "unit": "bottle", "min_stock_threshold": 6.0},
        {"name": "Amul Doodh 1L (Milk)", "unit": "packet", "min_stock_threshold": 5.0},
        {"name": "Toor Dal 1kg (Lentils)", "unit": "kg", "min_stock_threshold": 8.0},
        {"name": "Parle-G Biscuit", "unit": "packet", "min_stock_threshold": 20.0},
    ]

    item_map = {}
    for it in items_data:
        item = Item(
            name=it["name"],
            unit=it["unit"],
            min_stock_threshold=it["min_stock_threshold"]
        )
        db.add(item)
        item_map[it["name"]] = item
    db.commit()

    # 3. Initial Restock: calibrated so exactly 3 items are low stock (matching "Stock 3" header)
    # - Rice: 14 in - 10 customer udhaar = 4 left (min 10) => low stock (1)
    # - Atta: 20 in - 2 customer udhaar = 18 left (min 5) => ok
    # - Sugar: 22 in - 15 customer udhaar = 7 left (min 15) => low stock (2)
    # - Salt: 32 in - 10 customer udhaar = 22 left (min 8) => ok
    # - Oil: 6 in - 3 customer udhaar = 3 left (min 6) => low stock (3)
    # - Milk: 15 in - 5 customer udhaar = 10 left (min 5) => ok
    # - Dal: 16 in - 4 customer udhaar = 12 left (min 8) => ok
    # - Biscuit: 40 in - 10 customer udhaar = 30 left (min 20) => ok
    stock_ins = [
        {"item": item_map["Rice 5kg (Chawal)"], "qty": 14.0, "amount": 3500.0},
        {"item": item_map["Flour 5kg (Atta)"], "qty": 20.0, "amount": 4200.0},
        {"item": item_map["Sugar 1kg (Cheeni)"], "qty": 22.0, "amount": 990.0},
        {"item": item_map["Tata Salt 1kg (Namak)"], "qty": 32.0, "amount": 640.0},
        {"item": item_map["Mustard Oil 1L (Sarson Tel)"], "qty": 6.0, "amount": 840.0},
        {"item": item_map["Amul Doodh 1L (Milk)"], "qty": 15.0, "amount": 450.0},
        {"item": item_map["Toor Dal 1kg (Lentils)"], "qty": 16.0, "amount": 1920.0},
        {"item": item_map["Parle-G Biscuit"], "qty": 40.0, "amount": 400.0},
    ]
    for s in stock_ins:
        db.add(
            Entry(
                type="stock_in",
                item_id=s["item"].id,
                raw_item_name=s["item"].name,
                qty=s["qty"],
                unit=s["item"].unit,
                amount=s["amount"],
                notes="Inventory restock",
                created_at=now - timedelta(days=7),
            )
        )
    db.commit()

    # 4. Realistic Ledger Transactions (Credit & Payment) matching the screenshot
    entries_data = [
        # Sharma Ji: ₹1200 credit - ₹500 payment = ₹700 net balance
        {
            "customer": cust_map["Sharma Ji"],
            "type": "credit",
            "item": item_map["Sugar 1kg (Cheeni)"],
            "raw_item_name": "Cheeni (Sugar)",
            "qty": 10.0,
            "unit": "kg",
            "amount": 500.0,
            "notes": "Sugar udhaar",
            "created_at": now - timedelta(days=12),
        },
        {
            "customer": cust_map["Sharma Ji"],
            "type": "payment",
            "item": None,
            "raw_item_name": None,
            "qty": None,
            "unit": None,
            "amount": 500.0,
            "notes": "Cash payment",
            "created_at": now - timedelta(days=4),
        },
        {
            "customer": cust_map["Sharma Ji"],
            "type": "credit",
            "item": item_map["Rice 5kg (Chawal)"],
            "raw_item_name": "Chawal (Rice)",
            "qty": 5.0,
            "unit": "kilo",
            "amount": 700.0,
            "notes": "Chawal udhaar liya",
            "created_at": now - timedelta(hours=2), # Today
        },

        # Anita Devi: ₹2,400 credit
        {
            "customer": cust_map["Anita Devi"],
            "type": "credit",
            "item": item_map["Toor Dal 1kg (Lentils)"],
            "raw_item_name": "Dal (Lentils)",
            "qty": 4.0,
            "unit": "kg",
            "amount": 2400.0,
            "notes": "Grocery udhaar",
            "created_at": now - timedelta(days=1, hours=3), # Yesterday
        },

        # Raju Bhai: ₹2200 credit - ₹400 payment = ₹1,800 net balance
        {
            "customer": cust_map["Raju Bhai"],
            "type": "credit",
            "item": None,
            "raw_item_name": "Grocery Udhaar",
            "qty": None,
            "unit": None,
            "amount": 1800.0,
            "notes": "Old balance",
            "created_at": now - timedelta(days=8),
        },
        {
            "customer": cust_map["Raju Bhai"],
            "type": "payment",
            "item": None,
            "raw_item_name": None,
            "qty": None,
            "unit": None,
            "amount": 400.0,
            "notes": "UPI payment",
            "created_at": now - timedelta(days=4),
        },
        {
            "customer": cust_map["Raju Bhai"],
            "type": "credit",
            "item": item_map["Mustard Oil 1L (Sarson Tel)"],
            "raw_item_name": "Tel (Oil)",
            "qty": 3.0,
            "unit": "bottle",
            "amount": 400.0,
            "notes": "Tel udhaar",
            "created_at": now - timedelta(days=2), # Mon
        },

        # Kiran Store: ₹1,250 credit - ₹300 payment = ₹950 net balance
        {
            "customer": cust_map["Kiran Store"],
            "type": "credit",
            "item": None,
            "raw_item_name": "Grocery",
            "qty": None,
            "unit": None,
            "amount": 650.0,
            "notes": "Udhaar",
            "created_at": now - timedelta(days=7),
        },
        {
            "customer": cust_map["Kiran Store"],
            "type": "payment",
            "item": None,
            "raw_item_name": None,
            "qty": None,
            "unit": None,
            "amount": 300.0,
            "notes": "Cash received",
            "created_at": now - timedelta(days=5),
        },
        {
            "customer": cust_map["Kiran Store"],
            "type": "credit",
            "item": item_map["Flour 5kg (Atta)"],
            "raw_item_name": "Atta & Sugar",
            "qty": 2.0,
            "unit": "bag",
            "amount": 600.0,
            "notes": "Atta and sugar",
            "created_at": now - timedelta(days=3), # Sun
        },

        # Suresh Verma: ₹500 credit - ₹500 payment = ₹0 balance (cleared)
        {
            "customer": cust_map["Suresh Verma"],
            "type": "credit",
            "item": item_map["Amul Doodh 1L (Milk)"],
            "raw_item_name": "Milk",
            "qty": 5.0,
            "unit": "packet",
            "amount": 500.0,
            "notes": "Milk udhaar",
            "created_at": now - timedelta(hours=5),
        },
        {
            "customer": cust_map["Suresh Verma"],
            "type": "payment",
            "item": None,
            "raw_item_name": "Milk",
            "qty": None,
            "unit": None,
            "amount": 500.0,
            "notes": "Milk",
            "created_at": now - timedelta(hours=3), # Today
        },

        # Vikas Chawla: ₹320 credit = ₹320 balance
        {
            "customer": cust_map["Vikas Chawla"],
            "type": "credit",
            "item": item_map["Tata Salt 1kg (Namak)"],
            "raw_item_name": "Salt",
            "qty": 10.0,
            "unit": "packet",
            "amount": 320.0,
            "notes": "Tata salt packet",
            "created_at": now - timedelta(days=6), # 29 Sep
        },

        # Mannu Baveja: ₹5,000 credit
        {
            "customer": cust_map["Mannu Baveja"],
            "type": "credit",
            "item": item_map["Rice 5kg (Chawal)"],
            "raw_item_name": "Chawal (Rice)",
            "qty": 5.0,
            "unit": "bag",
            "amount": 5000.0,
            "notes": "Voice test entry",
            "created_at": now - timedelta(hours=1), # Today
        },

        # Harpreet Kaur: ₹180 credit
        {
            "customer": cust_map["Harpreet Kaur"],
            "type": "credit",
            "item": item_map["Parle-G Biscuit"],
            "raw_item_name": "Biscuits & Chai",
            "qty": 10.0,
            "unit": "packet",
            "amount": 180.0,
            "notes": "Biscuits",
            "created_at": now - timedelta(days=4),
        },

        # Mohammad Imran: ₹420 credit
        {
            "customer": cust_map["Mohammad Imran"],
            "type": "credit",
            "item": None,
            "raw_item_name": "Garam Masala",
            "qty": 3.0,
            "unit": "packet",
            "amount": 420.0,
            "notes": "Spices packet",
            "created_at": now - timedelta(days=5),
        },

        # Sunita Sharma: ₹850 credit
        {
            "customer": cust_map["Sunita Sharma"],
            "type": "credit",
            "item": None,
            "raw_item_name": "Desi Ghee",
            "qty": 1.0,
            "unit": "jar",
            "amount": 850.0,
            "notes": "Desi ghee jar",
            "created_at": now - timedelta(days=2),
        },
    ]

    for e in entries_data:
        db.add(
            Entry(
                customer_id=e["customer"].id,
                raw_customer_name=e["customer"].name,
                type=e["type"],
                item_id=e["item"].id if e["item"] else None,
                raw_item_name=e["raw_item_name"],
                qty=e["qty"],
                unit=e["unit"],
                amount=e["amount"],
                notes=e["notes"],
                created_at=e["created_at"],
            )
        )
    db.commit()
    print("Seed complete: 10 customers, 8 items, 3 low stock alerts, and realistic transactions inserted.")
    db.close()

def seed_if_empty():
    """Create or update demo data if Sharma Ji is missing (old seed format or empty)."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        sharma = db.query(Customer).filter(Customer.name == "Sharma Ji").first()
        needs_seed = sharma is None
    finally:
        db.close()

    if not needs_seed:
        return False

    seed()
    print("Demo database initialized with full customer and ledger data.")
    return True

if __name__ == "__main__":
    seed()
