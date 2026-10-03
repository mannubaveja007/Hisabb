from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.models import Item, Entry
from app.schemas import InventoryResponse, InventoryItem

router = APIRouter(prefix="/api", tags=["Inventory"])

@router.get("/inventory", response_model=InventoryResponse)
def get_inventory(db: Session = Depends(get_db)):
    # Stock computation in SQL:
    # + stock_in qty
    # - stock_out qty
    # - credit qty (goods given out to customer on udhaar)
    stock_calc = func.coalesce(
        func.sum(
            case(
                (Entry.type == "stock_in", Entry.qty),
                (Entry.type.in_(["stock_out", "credit"]), -Entry.qty),
                else_=0.0
            )
        ),
        0.0
    )
    last_updated = func.coalesce(func.max(Entry.created_at), Item.updated_at)

    rows = (
        db.query(
            Item.id,
            Item.name,
            Item.unit,
            Item.min_stock_threshold,
            stock_calc.label("current_stock"),
            last_updated.label("last_updated_at"),
        )
        .outerjoin(Entry, Item.id == Entry.item_id)
        .group_by(Item.id)
        .order_by(Item.name)
        .all()
    )

    items = []
    for r in rows:
        curr_stock = float(r.current_stock)
        min_thresh = float(r.min_stock_threshold)
        items.append(
            InventoryItem(
                id=r.id,
                name=r.name,
                unit=r.unit,
                current_stock=curr_stock,
                min_stock_threshold=min_thresh,
                low_stock=curr_stock <= min_thresh,
                last_updated_at=r.last_updated_at.isoformat(),
            )
        )

    return InventoryResponse(items=items)
