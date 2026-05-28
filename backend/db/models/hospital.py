"""
Region and Hospital models.
"""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .user import User
    from .inventory import Inventory
    from .alert import Alert
    from .agent import AgentLog
    from .chat import ChatSession
    from .risk import RiskScore
    from .procurement import ProcurementOrder


class Region(Base):
    __tablename__ = "regions"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    country: Mapped[str] = mapped_column(String, nullable=False, default="India")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    hospitals: Mapped[List["Hospital"]] = relationship("Hospital", back_populates="region")

    def __repr__(self) -> str:
        return f"<Region id={self.id} name={self.name!r}>"


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    region_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("regions.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    position_x: Mapped[float] = mapped_column(Float, nullable=False)
    position_y: Mapped[float] = mapped_column(Float, nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    region: Mapped["Region"] = relationship("Region", back_populates="hospitals")
    users: Mapped[List["User"]] = relationship("User", back_populates="hospital")
    inventory: Mapped[List["Inventory"]] = relationship("Inventory", back_populates="hospital")
    alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="hospital")
    agent_logs: Mapped[List["AgentLog"]] = relationship("AgentLog", back_populates="hospital")
    chat_sessions: Mapped[List["ChatSession"]] = relationship("ChatSession", back_populates="hospital")
    risk_scores: Mapped[List["RiskScore"]] = relationship("RiskScore", back_populates="hospital")
    procurement_orders: Mapped[List["ProcurementOrder"]] = relationship(
        "ProcurementOrder", back_populates="hospital"
    )

    def __repr__(self) -> str:
        return f"<Hospital id={self.id} name={self.name!r}>"
