"""
Agent registry and structured activity logs.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital


class AgentType(str, PyEnum):
    supply_intelligence = "supply_intelligence"
    procurement = "procurement"
    risk_analysis = "risk_analysis"
    emergency_monitoring = "emergency_monitoring"
    operations = "operations"
    executive_reporting = "executive_reporting"


class LogSeverity(str, PyEnum):
    info = "info"
    warning = "warning"
    error = "error"
    critical = "critical"


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    agent_type: Mapped[AgentType] = mapped_column(
        Enum(AgentType, name="agent_type"), nullable=False
    )
    status: Mapped[str] = mapped_column(String, nullable=False, default="active")
    last_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    logs: Mapped[List["AgentLog"]] = relationship(
        "AgentLog", back_populates="agent", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Agent id={self.id} name={self.name!r} type={self.agent_type}>"


class AgentLog(Base):
    """Structured activity log for AI agents.
    Full-text / unstructured intelligence goes to MongoDB agent_intelligence collection.
    """
    __tablename__ = "agent_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    agent_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    hospital_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("hospitals.id", ondelete="SET NULL"), index=True
    )
    severity: Mapped[LogSeverity] = mapped_column(
        Enum(LogSeverity, name="log_severity"), nullable=False, default=LogSeverity.info, index=True
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[Dict[str, Any]] = mapped_column(
        "metadata", JSONB, nullable=False, default=dict
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc), index=True
    )

    # Relationships
    agent: Mapped["Agent"] = relationship("Agent", back_populates="logs")
    hospital: Mapped[Optional["Hospital"]] = relationship("Hospital", back_populates="agent_logs")

    def __repr__(self) -> str:
        return f"<AgentLog id={self.id} agent={self.agent_id} severity={self.severity}>"
