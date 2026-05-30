"""
CareSync AI — Procurement Agent Tools (LangChain)

Six @tool-decorated functions that the Procurement Agent can call.
Each tool manages its own SQLAlchemy session and catches all exceptions,
returning {"error": ...} instead of raising so the agent loop continues.

Redis client is a module-level lazy singleton.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Optional

import redis as redis_lib
from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.orm import Session

from db.models.base import get_session_factory
from db.models import (
    Alert,
    AlertStatus,
    Hospital,
    Inventory,
    ProcurementOrder,
    OrderStatus,
    Resource,
    Supplier,
    SupplierResource,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_redis_client: Optional[redis_lib.Redis] = None


def _redis() -> redis_lib.Redis:
    """Lazy Redis singleton."""
    global _redis_client
    if _redis_client is None:
        _redis_client = redis_lib.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/0"),
            decode_responses=True,
        )
    return _redis_client


def _session() -> Session:
    """Open a new SQLAlchemy session."""
    factory = get_session_factory()
    return factory()


def _hospital_id_from_name(session: Session, name_fragment: str) -> str | None:
    """Resolve a partial hospital name to its UUID. Case-insensitive."""
    result = session.execute(
        select(Hospital.id, Hospital.name).where(
            Hospital.name.ilike(f"%{name_fragment}%"),
            Hospital.is_active.is_(True),
        )
    ).first()
    return str(result.id) if result else None


# ---------------------------------------------------------------------------
# Tool 1: get_hospital_metrics
# ---------------------------------------------------------------------------

@tool
def get_hospital_metrics(hospital_id: str) -> dict:
    """Get real-time metrics for a hospital: oxygen %, ICU %, pharma %,
    and current risk score/level. Tries Redis cache first; falls back to
    PostgreSQL if the cache is cold.

    Args:
        hospital_id: UUID string of the hospital, or a partial name like
                     'AIIMS' or 'Delhi' to resolve automatically.
    """
    session = _session()
    try:
        # Resolve name → UUID if necessary
        if not _looks_like_uuid(hospital_id):
            resolved = _hospital_id_from_name(session, hospital_id)
            if not resolved:
                return {"error": f"No hospital found matching '{hospital_id}'"}
            hospital_id = resolved

        # Try Redis first
        redis_key = f"hospital:{hospital_id}:metrics"
        cached = _redis().hgetall(redis_key)
        if cached:
            return {
                "hospital_id": hospital_id,
                "source": "cache",
                "oxygen": float(cached.get("oxygen", 0)),
                "icu": float(cached.get("icu", 0)),
                "pharma": float(cached.get("pharma", 0)),
                "risk_score": float(cached.get("risk_score", 0)),
                "risk_level": cached.get("risk_level", "unknown"),
                "updated_at": cached.get("updated_at"),
            }

        # Fallback: query PostgreSQL
        rows = session.execute(
            select(Resource.name, Inventory.current_level, Inventory.status)
            .join(Inventory, Inventory.resource_id == Resource.id)
            .where(Inventory.hospital_id == hospital_id)
        ).all()

        if not rows:
            return {"error": f"No inventory data for hospital '{hospital_id}'"}

        metrics: dict = {"hospital_id": hospital_id, "source": "database"}
        for row in rows:
            metrics[row.name] = round(row.current_level, 1)

        return metrics

    except Exception as exc:
        logger.exception("get_hospital_metrics failed")
        return {"error": str(exc)}
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Tool 2: get_inventory_status
# ---------------------------------------------------------------------------

@tool
def get_inventory_status(hospital_id: str) -> list[dict]:
    """Get detailed inventory for all resources at a hospital.
    Returns current level, capacity, status (stable/warning/critical),
    and trend (-1 declining, 0 stable, 1 improving) for each resource.

    Args:
        hospital_id: UUID string or partial hospital name.
    """
    session = _session()
    try:
        if not _looks_like_uuid(hospital_id):
            resolved = _hospital_id_from_name(session, hospital_id)
            if not resolved:
                return [{"error": f"No hospital found matching '{hospital_id}'"}]
            hospital_id = resolved

        rows = session.execute(
            select(
                Resource.name.label("resource"),
                Resource.unit,
                Resource.warning_threshold,
                Resource.critical_threshold,
                Inventory.current_level,
                Inventory.capacity_total,
                Inventory.status,
                Inventory.trend,
                Inventory.last_updated_at,
            )
            .join(Inventory, Inventory.resource_id == Resource.id)
            .where(Inventory.hospital_id == hospital_id)
            .order_by(Inventory.current_level)  # lowest first — most urgent at top
        ).all()

        if not rows:
            return [{"error": f"No inventory data for hospital '{hospital_id}'"}]

        trend_label = {-1: "declining", 0: "stable", 1: "improving"}
        return [
            {
                "resource": row.resource,
                "unit": row.unit,
                "current_level": round(row.current_level, 1),
                "capacity_total": row.capacity_total,
                "status": row.status.value if hasattr(row.status, "value") else str(row.status),
                "trend": trend_label.get(row.trend, "stable"),
                "warning_threshold": row.warning_threshold,
                "critical_threshold": row.critical_threshold,
                "last_updated_at": row.last_updated_at.isoformat() if row.last_updated_at else None,
            }
            for row in rows
        ]

    except Exception as exc:
        logger.exception("get_inventory_status failed")
        return [{"error": str(exc)}]
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Tool 3: search_suppliers
# ---------------------------------------------------------------------------

@tool
def search_suppliers(resource_name: str, max_lead_time_days: int = 7) -> list[dict]:
    """Find active suppliers that can provide a specific resource.
    Results are sorted by reliability score (highest first).

    Args:
        resource_name: Resource to search for (e.g. 'oxygen', 'pharmaceuticals',
                       'icu_beds', 'blood_supply', 'ventilators').
        max_lead_time_days: Filter out suppliers with longer lead times. Default 7.
    """
    session = _session()
    try:
        rows = session.execute(
            select(
                Supplier.id.label("supplier_id"),
                Supplier.name.label("supplier_name"),
                Supplier.reliability_score,
                Supplier.lead_time_days,
                Supplier.contact_email,
                Supplier.country,
                Supplier.logistics_risk_score,
                SupplierResource.unit_price,
                SupplierResource.available_quantity,
                Resource.name.label("resource_name"),
                Resource.unit,
            )
            .join(SupplierResource, SupplierResource.supplier_id == Supplier.id)
            .join(Resource, Resource.id == SupplierResource.resource_id)
            .where(
                Resource.name.ilike(f"%{resource_name}%"),
                Supplier.is_active.is_(True),
                Supplier.lead_time_days <= max_lead_time_days,
            )
            .order_by(Supplier.reliability_score.desc())
        ).all()

        if not rows:
            return [{"message": f"No active suppliers found for '{resource_name}' within {max_lead_time_days} day lead time."}]

        return [
            {
                "supplier_id": str(row.supplier_id),
                "supplier_name": row.supplier_name,
                "reliability_score": round(row.reliability_score, 1),
                "lead_time_days": row.lead_time_days,
                "logistics_risk_score": round(row.logistics_risk_score, 1),
                "contact_email": row.contact_email,
                "country": row.country,
                "resource": row.resource_name,
                "unit": row.unit,
                "unit_price": float(row.unit_price),
                "available_quantity": row.available_quantity,
            }
            for row in rows
        ]

    except Exception as exc:
        logger.exception("search_suppliers failed")
        return [{"error": str(exc)}]
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Tool 4: get_active_alerts
# ---------------------------------------------------------------------------

@tool
def get_active_alerts(hospital_id: str) -> list[dict]:
    """Get all open and acknowledged alerts for a hospital, most severe first.

    Args:
        hospital_id: UUID string or partial hospital name.
    """
    session = _session()
    try:
        if not _looks_like_uuid(hospital_id):
            resolved = _hospital_id_from_name(session, hospital_id)
            if not resolved:
                return [{"error": f"No hospital found matching '{hospital_id}'"}]
            hospital_id = resolved

        severity_order = {"critical": 0, "high": 1, "moderate": 2, "low": 3}

        rows = session.execute(
            select(
                Alert.id,
                Alert.alert_type,
                Alert.severity,
                Alert.message,
                Alert.status,
                Alert.created_at,
                Resource.name.label("resource_name"),
            )
            .outerjoin(Resource, Resource.id == Alert.resource_id)
            .where(
                Alert.hospital_id == hospital_id,
                Alert.status.in_([AlertStatus.open, AlertStatus.acknowledged]),
            )
            .order_by(Alert.created_at.desc())
        ).all()

        if not rows:
            return [{"message": "No active alerts for this hospital."}]

        alerts = [
            {
                "alert_id": str(row.id),
                "type": row.alert_type.value if hasattr(row.alert_type, "value") else str(row.alert_type),
                "severity": row.severity.value if hasattr(row.severity, "value") else str(row.severity),
                "resource": row.resource_name,
                "message": row.message,
                "status": row.status.value if hasattr(row.status, "value") else str(row.status),
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in rows
        ]
        # Sort by severity priority
        alerts.sort(key=lambda a: severity_order.get(a["severity"], 99))
        return alerts

    except Exception as exc:
        logger.exception("get_active_alerts failed")
        return [{"error": str(exc)}]
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Tool 5: create_procurement_order
# ---------------------------------------------------------------------------

@tool
def create_procurement_order(
    hospital_id: str,
    supplier_id: str,
    resource_name: str,
    quantity: int,
    notes: str = "",
    user_confirmed: bool = False,
) -> dict:
    """Create a DRAFT procurement order for a hospital.
    The order remains in 'draft' status — human approval is required before
    it is submitted to the supplier.

    Do not call this tool until the user has explicitly confirmed the exact
    hospital, resource, quantity, selected supplier, unit price, estimated total,
    lead time, and notes/justification. If anything is missing or ambiguous, ask
    the user a follow-up question instead.

    Args:
        hospital_id: UUID or partial hospital name.
        supplier_id: UUID of the supplier (from search_suppliers results).
        resource_name: Resource type (e.g. 'oxygen', 'pharmaceuticals').
        quantity: Number of units to order.
        notes: Optional notes or justification for the order.
        user_confirmed: True only after the user explicitly approves the exact
                        draft order details. Defaults to False and will be rejected.
    """
    missing_fields = []
    if not hospital_id or not str(hospital_id).strip():
        missing_fields.append("hospital_id")
    if not supplier_id or not str(supplier_id).strip():
        missing_fields.append("supplier_id")
    if not resource_name or not str(resource_name).strip():
        missing_fields.append("resource_name")
    if quantity is None or quantity <= 0:
        missing_fields.append("quantity")

    if missing_fields:
        return {
            "error": "Cannot create procurement order without required fields.",
            "missing_fields": missing_fields,
            "next_step": "Ask the user for the missing order details before drafting.",
        }

    if not user_confirmed:
        return {
            "error": "Cannot create procurement order without explicit user confirmation.",
            "required_confirmation": [
                "hospital",
                "resource",
                "quantity",
                "supplier",
                "unit_price",
                "estimated_total",
                "lead_time_days",
                "notes_or_no_notes",
            ],
            "next_step": (
                "Present the exact draft order details to the user and ask for "
                "confirmation before calling this tool again."
            ),
        }

    session = _session()
    try:
        # Resolve hospital name if needed
        if not _looks_like_uuid(hospital_id):
            resolved = _hospital_id_from_name(session, hospital_id)
            if not resolved:
                return {"error": f"No hospital found matching '{hospital_id}'"}
            hospital_id = resolved

        # Look up resource by name
        resource = session.execute(
            select(Resource).where(Resource.name.ilike(f"%{resource_name}%"))
        ).scalar_one_or_none()
        if not resource:
            return {"error": f"Resource '{resource_name}' not found."}

        # Get supplier + pricing for this resource
        supplier_row = session.execute(
            select(
                Supplier.id,
                Supplier.name,
                Supplier.reliability_score,
                Supplier.lead_time_days,
                SupplierResource.unit_price,
                SupplierResource.available_quantity,
            )
            .join(SupplierResource, SupplierResource.supplier_id == Supplier.id)
            .where(
                Supplier.id == supplier_id,
                SupplierResource.resource_id == resource.id,
                Supplier.is_active.is_(True),
            )
        ).first()

        if not supplier_row:
            return {
                "error": (
                    f"Supplier '{supplier_id}' does not supply '{resource_name}', "
                    "or supplier is inactive."
                )
            }

        if supplier_row.available_quantity < quantity:
            return {
                "error": (
                    f"Supplier only has {supplier_row.available_quantity} units available; "
                    f"requested {quantity}."
                )
            }

        order = ProcurementOrder(
            hospital_id=hospital_id,
            supplier_id=supplier_id,
            resource_id=resource.id,
            quantity=quantity,
            unit_price=supplier_row.unit_price,
            status=OrderStatus.draft,
            notes=notes or None,
        )
        session.add(order)
        session.commit()
        session.refresh(order)

        return {
            "order_id": str(order.id),
            "status": "draft",
            "hospital_id": hospital_id,
            "supplier_name": supplier_row.name,
            "resource": resource.name,
            "quantity": quantity,
            "unit_price": float(supplier_row.unit_price),
            "estimated_total": float(supplier_row.unit_price) * quantity,
            "lead_time_days": supplier_row.lead_time_days,
            "note": "Order created as DRAFT. Human approval required before submission.",
        }

    except Exception as exc:
        session.rollback()
        logger.exception("create_procurement_order failed")
        return {"error": str(exc)}
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Tool 6: get_procurement_orders
# ---------------------------------------------------------------------------

@tool
def get_procurement_orders(hospital_id: str, status: str = "all") -> list[dict]:
    """Get recent procurement orders for a hospital (last 20, newest first).

    Args:
        hospital_id: UUID or partial hospital name.
        status: Filter by order status. One of: all, draft, submitted, approved,
                confirmed, delivered, cancelled. Default is 'all'.
    """
    session = _session()
    try:
        if not _looks_like_uuid(hospital_id):
            resolved = _hospital_id_from_name(session, hospital_id)
            if not resolved:
                return [{"error": f"No hospital found matching '{hospital_id}'"}]
            hospital_id = resolved

        query = (
            select(
                ProcurementOrder.id,
                ProcurementOrder.quantity,
                ProcurementOrder.unit_price,
                ProcurementOrder.total_cost,
                ProcurementOrder.status,
                ProcurementOrder.created_at,
                ProcurementOrder.estimated_delivery,
                ProcurementOrder.notes,
                Supplier.name.label("supplier_name"),
                Resource.name.label("resource_name"),
            )
            .join(Supplier, Supplier.id == ProcurementOrder.supplier_id)
            .join(Resource, Resource.id == ProcurementOrder.resource_id)
            .where(ProcurementOrder.hospital_id == hospital_id)
            .order_by(ProcurementOrder.created_at.desc())
            .limit(20)
        )

        if status != "all":
            try:
                status_enum = OrderStatus(status)
                query = query.where(ProcurementOrder.status == status_enum)
            except ValueError:
                return [{"error": f"Invalid status '{status}'. Valid values: all, draft, submitted, approved, confirmed, delivered, cancelled"}]

        rows = session.execute(query).all()

        if not rows:
            return [{"message": f"No procurement orders found for hospital '{hospital_id}' with status '{status}'."}]

        return [
            {
                "order_id": str(row.id),
                "resource": row.resource_name,
                "supplier": row.supplier_name,
                "quantity": row.quantity,
                "unit_price": float(row.unit_price),
                "total_cost": float(row.total_cost) if row.total_cost else None,
                "status": row.status.value if hasattr(row.status, "value") else str(row.status),
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "estimated_delivery": str(row.estimated_delivery) if row.estimated_delivery else None,
                "notes": row.notes,
            }
            for row in rows
        ]

    except Exception as exc:
        logger.exception("get_procurement_orders failed")
        return [{"error": str(exc)}]
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _looks_like_uuid(value: str) -> bool:
    """Simple heuristic: UUIDs are 36 chars with hyphens."""
    return len(value) == 36 and value.count("-") == 4


# Exported tool list for agent binding
PROCUREMENT_TOOLS = [
    get_hospital_metrics,
    get_inventory_status,
    search_suppliers,
    get_active_alerts,
    create_procurement_order,
    get_procurement_orders,
]
