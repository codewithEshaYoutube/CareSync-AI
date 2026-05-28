"""
ProcurementOrder model.
total_cost is a database-computed column (quantity × unit_price).
"""

import uuid
from datetime import date, datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Computed, Date, DateTime, Enum, ForeignKey, Integer, Numeric, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital
    from .supplier import Supplier
    from .inventory import Resource
    from .user import User


class OrderStatus(str, PyEnum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    confirmed = "confirmed"
    delivered = "delivered"
    cancelled = "cancelled"


class ProcurementOrder(Base):
    __tablename__ = "procurement_orders"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("hospitals.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("suppliers.id", ondelete="RESTRICT"), nullable=False
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resources.id", ondelete="RESTRICT"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    # total_cost is GENERATED ALWAYS AS (quantity * unit_price) STORED in PostgreSQL.
    # Mapped as server-computed; do not set manually.
    total_cost: Mapped[Optional[float]] = mapped_column(
        Numeric(12, 2), Computed("quantity * unit_price", persisted=True), nullable=True
    )
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status"), nullable=False, default=OrderStatus.draft, index=True
    )
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )
    estimated_delivery: Mapped[Optional[date]] = mapped_column(Date)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="procurement_orders")
    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="procurement_orders")
    resource: Mapped["Resource"] = relationship("Resource", back_populates="procurement_orders")
    creator: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[created_by], back_populates="procurement_orders"
    )

    def __repr__(self) -> str:
        return f"<ProcurementOrder id={self.id} status={self.status} hospital={self.hospital_id}>"
