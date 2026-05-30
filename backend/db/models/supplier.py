"""
Supplier and SupplierResource models.
"""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Numeric, String, text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .inventory import Resource
    from .procurement import ProcurementOrder


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    reliability_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    lead_time_days: Mapped[Optional[int]] = mapped_column(Integer)
    contact_email: Mapped[Optional[str]] = mapped_column(String)
    country: Mapped[Optional[str]] = mapped_column(String)
    logistics_risk_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    supplier_resources: Mapped[List["SupplierResource"]] = relationship(
        "SupplierResource", back_populates="supplier", cascade="all, delete-orphan"
    )
    procurement_orders: Mapped[List["ProcurementOrder"]] = relationship(
        "ProcurementOrder", back_populates="supplier"
    )

    def __repr__(self) -> str:
        return f"<Supplier id={self.id} name={self.name!r} reliability={self.reliability_score}>"


class SupplierResource(Base):
    __tablename__ = "supplier_resources"
    __table_args__ = (
        UniqueConstraint("supplier_id", "resource_id", name="uq_supplier_resource"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resources.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    available_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="supplier_resources")
    resource: Mapped["Resource"] = relationship("Resource", back_populates="supplier_resources")

    def __repr__(self) -> str:
        return f"<SupplierResource supplier={self.supplier_id} resource={self.resource_id} price={self.unit_price}>"
