"""
Database seed script with 10 Indian retail customers and initial ledger data.
"""
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

    # 1. 10 Fake Customers
    customers_data = [
        {"name": "Ramesh Kumar", "phone": "9876543210"},
        {"name": "Suresh Verma", "phone": "9812345678"},
        {"name": "Anita Sharma", "phone": "9823456789"},
        {"name": "Manpreet Singh", "phone": "9834567890"},
        {"name": "Pooja Gupta", "phone": "9845678901"},
        {"name": "Rajinder Prasad", "phone": "9856789012"},
        {"name": "Harpreet Kaur", "phone": "9867890123"},
        {"name": "Vikas Chawla", "phone": "9878901234"},
        {"name": "Sunita Devi", "phone": "9889012345"},
        {"name": "Mohammad Imran", "phone": "9890123456"},
    ]

    customers = []
    for c in customers_data:
        cust = Customer(name=c["name"], phone=c["phone"])
        db.add(cust)
        customers.append(cust)
    db.commit()

    # 2. Inventory Items
    items_data = [
        {"name": "Amul Doodh", "unit": "packet", "min_stock_threshold": 10.0},
        {"name": "Aashirvaad Atta 5kg", "unit": "bag", "min_stock_threshold": 5.0},
        {"name": "Madhur Cheeni 1kg", "unit": "kg", "min_stock_threshold": 15.0},
        {"name": "Tata Namak 1kg", "unit": "packet", "min_stock_threshold": 8.0},
        {"name": "Fortune Sarson Tel 1L", "unit": "bottle", "min_stock_threshold": 6.0},
        {"name": "Parle-G Biscuit", "unit": "packet", "min_stock_threshold": 20.0},
    ]

    items = []
    for it in items_data:
        item = Item(
            name=it["name"],
            unit=it["unit"],
            min_stock_threshold=it["min_stock_threshold"]
        )
        db.add(item)
        items.append(item)
    db.commit()

    # 3. Initial Stock In
    stock_ins = [
        {"item": items[0], "qty": 30.0, "amount": 990.0},
        {"item": items[1], "qty": 20.0, "amount": 4200.0},
        {"item": items[2], "qty": 40.0, "amount": 1800.0},
        {"item": items[3], "qty": 25.0, "amount": 500.0},
        {"item": items[4], "qty": 15.0, "amount": 2100.0},
        {"item": items[5], "qty": 50.0, "amount": 500.0},
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
                notes="Initial inventory restock"
            )
        )
    db.commit()

    # 4. Customer Entries (Credit & Payment)
    entries_data = [
        # Ramesh Kumar: ₹1200 credit - ₹500 payment = ₹700 balance
        {"customer": customers[0], "type": "credit", "item": items[1], "qty": 2.0, "unit": "bag", "amount": 1200.0, "notes": "Atta udhaar"},
        {"customer": customers[0], "type": "payment", "item": None, "qty": None, "unit": None, "amount": 500.0, "notes": "Cash payment"},
        # Anita Sharma: ₹450 credit = ₹450 balance
        {"customer": customers[2], "type": "credit", "item": items[2], "qty": 5.0, "unit": "kg", "amount": 450.0, "notes": "Cheeni udhaar"},
        # Manpreet Singh: ₹280 credit = ₹280 balance
        {"customer": customers[3], "type": "credit", "item": items[4], "qty": 2.0, "unit": "bottle", "amount": 280.0, "notes": "Tel udhaar"},
        # Suresh Verma: ₹500 credit - ₹500 payment = ₹0 balance
        {"customer": customers[1], "type": "credit", "item": None, "qty": None, "unit": None, "amount": 500.0, "notes": "Grocery udhaar"},
        {"customer": customers[1], "type": "payment", "item": None, "qty": None, "unit": None, "amount": 500.0, "notes": "Full payment cleared"},
    ]

    for e in entries_data:
        db.add(
            Entry(
                customer_id=e["customer"].id,
                raw_customer_name=e["customer"].name,
                type=e["type"],
                item_id=e["item"].id if e["item"] else None,
                raw_item_name=e["item"].name if e["item"] else None,
                qty=e["qty"],
                unit=e["unit"],
                amount=e["amount"],
                notes=e["notes"]
            )
        )
    db.commit()
    print("Seed complete: 10 customers, 6 items, initial stock, and sample transactions inserted.")
    db.close()

def seed_if_empty():
    """Create the demo ledger only for a brand-new empty database."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Customer).first() is None:
            seed()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
