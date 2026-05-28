"""
User model — authenticated staff members.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital
    from .chat import ChatSession
    from .alert import Alert
    from .procurement import ProcurementOrder


class UserRole(str, PyEnum):
    admin = "admin"
    operator = "operator"
    viewer = "viewer"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), nullable=False, default=UserRole.viewer
    )
    hospital_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("hospitals.id", ondelete="SET NULL"), index=True
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    hospital: Mapped[Optional["Hospital"]] = relationship("Hospital", back_populates="users")
    chat_sessions: Mapped[List["ChatSession"]] = relationship("ChatSession", back_populates="user")
    resolved_alerts: Mapped[List["Alert"]] = relationship(
        "Alert", foreign_keys="Alert.resolved_by", back_populates="resolver"
    )
    procurement_orders: Mapped[List["ProcurementOrder"]] = relationship(
        "ProcurementOrder", foreign_keys="ProcurementOrder.created_by", back_populates="creator"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"
