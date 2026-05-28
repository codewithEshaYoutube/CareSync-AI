"""
CareSync AI — SQLAlchemy models package.

Import all models here so that:
1. A single `from db.models import *` gives access to every model.
2. Alembic's `env.py` can point to `Base.metadata` for autogenerate.

Usage:
    from db.models import Base, Hospital, Region, User, ...
    from db.models.base import get_engine, get_session_factory
"""

from .base import Base, get_engine, get_session_factory  # noqa: F401

from .hospital import Region, Hospital  # noqa: F401
from .user import User, UserRole  # noqa: F401
from .inventory import Resource, Inventory, InventoryHistory, InventoryStatus  # noqa: F401
from .supplier import Supplier, SupplierResource  # noqa: F401
from .procurement import ProcurementOrder, OrderStatus  # noqa: F401
from .alert import Alert, AlertType, AlertSeverity, AlertStatus  # noqa: F401
from .agent import Agent, AgentLog, AgentType, LogSeverity  # noqa: F401
from .chat import ChatSession, ChatMessage, MessageRole  # noqa: F401
from .risk import RiskScore, RiskLevel  # noqa: F401

__all__ = [
    # Base
    "Base",
    "get_engine",
    "get_session_factory",
    # Hospital
    "Region",
    "Hospital",
    # User
    "User",
    "UserRole",
    # Inventory
    "Resource",
    "Inventory",
    "InventoryHistory",
    "InventoryStatus",
    # Supplier
    "Supplier",
    "SupplierResource",
    # Procurement
    "ProcurementOrder",
    "OrderStatus",
    # Alert
    "Alert",
    "AlertType",
    "AlertSeverity",
    "AlertStatus",
    # Agent
    "Agent",
    "AgentLog",
    "AgentType",
    "LogSeverity",
    # Chat
    "ChatSession",
    "ChatMessage",
    "MessageRole",
    # Risk
    "RiskScore",
    "RiskLevel",
]
