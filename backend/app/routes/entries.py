from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Entry, Customer, Item
from app.schemas import CreateEntriesRequest, CreateEntriesResponse, SavedLedgerEntry

router = APIRouter(prefix="/api", tags=["Entries"])

@router.post("/entries", response_model=CreateEntriesResponse, status_code=status.HTTP_201_CREATED)
def create_entries(payload: CreateEntriesRequest, db: Session = Depends(get_db)):
    saved_entries = []

    for entry_in in payload.entries:
        # Resolve customer if needed
        customer_id = entry_in.customer_id
        if not customer_id and entry_in.raw_customer_name:
            from app.services.fuzzy_service import transliterate_name, is_devanagari
            clean_name = (
                transliterate_name(entry_in.raw_customer_name.strip())
                if is_devanagari(entry_in.raw_customer_name)
                else entry_in.raw_customer_name.strip()
            )
            existing_cust = (
                db.query(Customer)
                .filter(
                    (Customer.name.ilike(clean_name)) |
                    (Customer.name.ilike(entry_in.raw_customer_name.strip()))
                )
                .first()
            )
            if existing_cust:
                customer_id = existing_cust.id
            else:
                new_cust = Customer(name=clean_name)
                db.add(new_cust)
                db.flush()
                customer_id = new_cust.id

        # Resolve item if needed
        item_id = entry_in.item_id
        if not item_id and entry_in.raw_item_name:
            existing_item = (
                db.query(Item)
                .filter(Item.name.ilike(entry_in.raw_item_name.strip()))
                .first()
            )
            if existing_item:
                item_id = existing_item.id
            else:
                new_item = Item(
                    name=entry_in.raw_item_name.strip(),
                    unit=entry_in.unit or "unit"
                )
                db.add(new_item)
                db.flush()
                item_id = new_item.id

        db_entry = Entry(
            customer_id=customer_id,
            raw_customer_name=entry_in.raw_customer_name,
            type=entry_in.type,
            item_id=item_id,
            raw_item_name=entry_in.raw_item_name,
            qty=entry_in.qty,
            unit=entry_in.unit,
            amount=entry_in.amount,
            notes=entry_in.notes
        )
        db.add(db_entry)
        db.flush()

        customer_name = None
        if db_entry.customer_id:
            c = db.query(Customer).filter(Customer.id == db_entry.customer_id).first()
            if c:
                customer_name = c.name

        item_name = None
        if db_entry.item_id:
            it = db.query(Item).filter(Item.id == db_entry.item_id).first()
            if it:
                item_name = it.name

        saved_entries.append(
            SavedLedgerEntry(
                id=db_entry.id,
                customer_id=db_entry.customer_id,
                customer_name=customer_name or db_entry.raw_customer_name,
                type=db_entry.type,
                item_id=db_entry.item_id,
                item_name=item_name or db_entry.raw_item_name,
                qty=db_entry.qty,
                unit=db_entry.unit,
                amount=db_entry.amount,
                notes=db_entry.notes,
                created_at=db_entry.created_at.isoformat()
            )
        )

    db.commit()
    return CreateEntriesResponse(
        saved_count=len(saved_entries),
        entries=saved_entries
    )
