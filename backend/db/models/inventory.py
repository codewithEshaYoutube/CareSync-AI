"""
Resource catalog, current inventory, and time-series history.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, SmallInteger, String, Text, text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital
    from .supplier import SupplierResource
    from .alert import Alert
    from .procurement import ProcurementOrder


class InventoryStatus(str, PyEnum):
    stable = "stable"
    warning = "warning"
    critical = "critical"


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    unit: Mapped[str] = mapped_column(String, nullable=False)
    warning_threshold: Mapped[float] = mapped_column(Float, nullable=False, default=70.0)
    critical_threshold: Mapped[float] = mapped_column(Float, nullable=False, default=40.0)
    description: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    inventory: Mapped[List["Inventory"]] = relationship("Inventory", back_populates="resource")
    history: Mapped[List["InventoryHistory"]] = relationship("InventoryHistory", back_populates="resource")
    supplier_resources: Mapped[List["SupplierResource"]] = relationship(
        "SupplierResource", back_populates="resource"
    )
    alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="resource")
    procurement_orders: Mapped[List["ProcurementOrder"]] = relationship(
        "ProcurementOrder", back_populates="resource"
    )

    def __repr__(self) -> str:
        return f"<Resource id={self.id} name={self.name!r}>"


class Inventory(Base):
    __tablename__ = "inventory"
    __table_args__ = (UniqueConstraint("hospital_id", "resource_id", name="uq_inventory_hospital_resource"),)

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resources.id", ondelete="RESTRICT"), nullable=False
    )
    current_level: Mapped[float] = mapped_column(Float, nullable=False)
    capacity_total: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[InventoryStatus] = mapped_column(
        Enum(InventoryStatus, name="inventory_status"), nullable=False, default=InventoryStatus.stable, index=True
    )
    # trend: -1 = declining, 0 = stable, 1 = improving
    trend: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    last_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="inventory")
    resource: Mapped["Resource"] = relationship("Resource", back_populates="inventory")
    history: Mapped[List["InventoryHistory"]] = relationship("InventoryHistory", back_populates="inventory")

    def __repr__(self) -> str:
        return f"<Inventory hospital={self.hospital_id} resource={self.resource_id} level={self.current_level}>"


class InventoryHistory(Base):
    """Append-only time-series of inventory readings.
    Candidate for TimescaleDB hypertable conversion on recorded_at.
    """
    __tablename__ = "inventory_history"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    inventory_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("inventory.id", ondelete="CASCADE"), nullable=False
    )
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resources.id", ondelete="RESTRICT"), nullable=False
    )
    value: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc), index=True
    )

    # Relationships
    inventory: Mapped["Inventory"] = relationship("Inventory", back_populates="history")
    hospital: Mapped["Hospital"] = relationship("Hospital")
    resource: Mapped["Resource"] = relationship("Resource", back_populates="history")

    def __repr__(self) -> str:
        return f"<InventoryHistory hospital={self.hospital_id} resource={self.resource_id} value={self.value} at={self.recorded_at}>"
