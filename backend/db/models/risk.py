"""
RiskScore model — computed per-hospital risk assessments.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING, Any, Dict

from sqlalchemy import DateTime, Enum, Float, ForeignKey, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital


class RiskLevel(str, PyEnum):
    low = "low"
    moderate = "moderate"
    high = "high"
    critical = "critical"


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True
    )
    score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel, name="risk_level"), nullable=False
    )
    contributing_factors: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc), index=True
    )

    # Relationships
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="risk_scores")

    def __repr__(self) -> str:
        return f"<RiskScore hospital={self.hospital_id} score={self.score} level={self.risk_level}>"
