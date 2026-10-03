import urllib.parse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.models import Customer, Entry
from app.schemas import (
    WeeklySummaryResponse,
    WeeklyReminderItem,
    CustomerSummaryRef,
)

router = APIRouter(prefix="/api/summary", tags=["Summary"])

@router.get("/weekly", response_model=WeeklySummaryResponse)
def get_weekly_summary(db: Session = Depends(get_db)):
    credit_sum = func.coalesce(
        func.sum(case((Entry.type == "credit", Entry.amount), else_=0.0)),
        0.0
    )
    payment_sum = func.coalesce(
        func.sum(case((Entry.type == "payment", Entry.amount), else_=0.0)),
        0.0
    )

    rows = (
        db.query(
            Customer.id,
            Customer.name,
            Customer.phone,
            (credit_sum - payment_sum).label("balance"),
        )
        .outerjoin(Entry, Customer.id == Entry.customer_id)
        .group_by(Customer.id)
        .having((credit_sum - payment_sum) > 0.0)
        .order_by((credit_sum - payment_sum).desc())
        .all()
    )

    reminders = []
    for r in rows:
        bal = float(r.balance)
        reminder_text = (
            f"Namaste {r.name} ji, aapka dukaan ka kul baaki hisaab ₹{bal:.2f} hai. "
            f"Kripya samay par bhuqtan karein. Dhanyawad!"
        )

        # Sanitize phone number for Indian standard (ensure 91 prefix if 10 digits)
        phone = r.phone or ""
        clean_phone = "".join(filter(str.isdigit, phone))
        if len(clean_phone) == 10:
            clean_phone = "91" + clean_phone

        encoded_text = urllib.parse.quote(reminder_text)
        wa_link = f"https://wa.me/{clean_phone}?text={encoded_text}" if clean_phone else f"https://wa.me/?text={encoded_text}"

        reminders.append(
            WeeklyReminderItem(
                customer=CustomerSummaryRef(
                    id=r.id,
                    name=r.name,
                    phone=r.phone,
                ),
                balance=bal,
                reminder_text=reminder_text,
                wa_link=wa_link,
            )
        )

    return reminders
