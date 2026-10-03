from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc
from app.database import get_db
from app.models import Customer, Entry
from app.schemas import (
    CustomerBalancesResponse,
    CustomerBalanceItem,
    CustomerHistoryResponse,
    CustomerHistoryProfile,
    CustomerHistoryRecord,
)

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("/balances", response_model=CustomerBalancesResponse)
def get_customer_balances(db: Session = Depends(get_db)):
    # Balance = sum(credit) - sum(payment) executed directly in SQL
    credit_sum = func.coalesce(
        func.sum(case((Entry.type == "credit", Entry.amount), else_=0.0)),
        0.0
    )
    payment_sum = func.coalesce(
        func.sum(case((Entry.type == "payment", Entry.amount), else_=0.0)),
        0.0
    )
    last_tx = func.max(Entry.created_at)

    results = (
        db.query(
            Customer.id,
            Customer.name,
            Customer.phone,
            credit_sum.label("total_credit"),
            payment_sum.label("total_paid"),
            (credit_sum - payment_sum).label("balance"),
            last_tx.label("last_transaction_at"),
        )
        .outerjoin(Entry, Customer.id == Entry.customer_id)
        .group_by(Customer.id)
        .order_by(desc("balance"), Customer.name)
        .all()
    )

    customers = [
        CustomerBalanceItem(
            id=r.id,
            name=r.name,
            phone=r.phone,
            total_credit=float(r.total_credit),
            total_paid=float(r.total_paid),
            balance=float(r.balance),
            last_transaction_at=r.last_transaction_at.isoformat() if r.last_transaction_at else None,
        )
        for r in results
    ]

    return CustomerBalancesResponse(customers=customers)

@router.get("/{id}/history", response_model=CustomerHistoryResponse)
def get_customer_history(id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Compute balance in SQL
    credit_sum = func.coalesce(
        func.sum(case((Entry.type == "credit", Entry.amount), else_=0.0)),
        0.0
    )
    payment_sum = func.coalesce(
        func.sum(case((Entry.type == "payment", Entry.amount), else_=0.0)),
        0.0
    )
    bal_row = (
        db.query((credit_sum - payment_sum).label("balance"))
        .filter(Entry.customer_id == id)
        .first()
    )
    current_balance = float(bal_row.balance) if bal_row and bal_row.balance is not None else 0.0

    entries = (
        db.query(Entry)
        .filter(Entry.customer_id == id)
        .order_by(desc(Entry.created_at))
        .all()
    )

    history = [
        CustomerHistoryRecord(
            id=e.id,
            type=e.type,
            amount=float(e.amount),
            item_name=e.item.name if e.item else e.raw_item_name,
            qty=float(e.qty) if e.qty is not None else None,
            unit=e.unit,
            notes=e.notes,
            created_at=e.created_at.isoformat(),
        )
        for e in entries
    ]

    return CustomerHistoryResponse(
        customer=CustomerHistoryProfile(
            id=customer.id,
            name=customer.name,
            phone=customer.phone,
            balance=current_balance,
        ),
        history=history,
    )
