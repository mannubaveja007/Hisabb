from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    entries = relationship("Entry", back_populates="customer")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)
    unit = Column(String, default="unit", nullable=False)
    min_stock_threshold = Column(Float, default=5.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    entries = relationship("Entry", back_populates="item")

class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    raw_customer_name = Column(String, nullable=True)
    type = Column(String, nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="SET NULL"), nullable=True, index=True)
    raw_item_name = Column(String, nullable=True)
    qty = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    amount = Column(Float, default=0.0, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    customer = relationship("Customer", back_populates="entries")
    item = relationship("Item", back_populates="entries")

    __table_args__ = (
        CheckConstraint("type IN ('credit', 'payment', 'stock_in', 'stock_out')", name="check_valid_entry_type"),
        CheckConstraint("amount >= 0.0", name="check_positive_amount"),
    )
