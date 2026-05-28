"""
CareSync AI — FastAPI Backend
Run with: uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging
import os
import uuid
from contextlib import contextmanager
from datetime import date, timedelta
from typing import Any, Generator, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from db.models import (
    Agent,
    AgentLog,
    Alert,
    Hospital,
    Inventory,
    OrderStatus,
    ProcurementOrder,
    Resource,
    RiskScore,
    Supplier,
    SupplierResource,
)
from db.models.base import get_session_factory

load_dotenv()

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CareSync AI API",
    description="Autonomous Healthcare Supply Chain Intelligence Platform",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server and any configured origins
# ---------------------------------------------------------------------------
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str      # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    hospital_id: Optional[str] = None
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    tool_calls: List[dict] = Field(default_factory=list)
    tokens_used: Optional[int] = None


class ProcurementOrderCreate(BaseModel):
    hospital_id: str
    supplier_id: str
    resource_name: Optional[str] = None
    resource_id: Optional[str] = None
    quantity: int = Field(gt=0)
    notes: Optional[str] = None
    created_by: Optional[str] = None
    estimated_delivery: Optional[date] = None


class ProcurementOrderStatusUpdate(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def _enum_value(value: Any) -> Any:
    """Return JSON-friendly values for Enum-backed SQLAlchemy fields."""
    return value.value if hasattr(value, "value") else value


def _iso(value: Any) -> str | None:
    """Serialize datetime/date values for API responses."""
    return value.isoformat() if value else None


def _parse_uuid(value: str, label: str = "id") -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {label}") from exc


def _parse_order_status(value: str) -> OrderStatus:
    try:
        return OrderStatus(value)
    except ValueError as exc:
        valid = ", ".join(status.value for status in OrderStatus)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid order status. Valid values: {valid}",
        ) from exc


@contextmanager
def _db_session() -> Generator[Session, None, None]:
    session = get_session_factory()()
    try:
        yield session
    except SQLAlchemyError as exc:
        session.rollback()
        logger.exception("database query failed")
        raise HTTPException(
            status_code=503,
            detail=(
                "Database unavailable or not initialized. Confirm DATABASE_URL "
                "and run backend/db/migrations/001_init_schema.sql and "
                "002_seed_data.sql."
            ),
        ) from exc
    finally:
        session.close()


def _get_resource_for_order(
    session: Session,
    *,
    resource_id: str | None,
    resource_name: str | None,
) -> Resource:
    if resource_id:
        resource_uuid = _parse_uuid(resource_id, "resource_id")
        resource = session.get(Resource, resource_uuid)
    elif resource_name:
        resource = session.scalars(
            select(Resource).where(Resource.name.ilike(f"%{resource_name}%"))
        ).first()
    else:
        raise HTTPException(
            status_code=400,
            detail="resource_id or resource_name is required",
        )

    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


def _risk_payload(row: RiskScore | None) -> dict | None:
    if not row:
        return None
    return {
        "score": round(row.score, 1),
        "risk_level": _enum_value(row.risk_level),
        "contributing_factors": row.contributing_factors,
        "calculated_at": _iso(row.calculated_at),
    }


def _hospital_payload(
    hospital: Hospital,
    *,
    inventory: list[Inventory] | None = None,
    risk: RiskScore | None = None,
    active_alert_count: int | None = None,
) -> dict:
    status = "stable"
    if inventory:
        statuses = {_enum_value(item.status) for item in inventory}
        if "critical" in statuses:
            status = "critical"
        elif "warning" in statuses:
            status = "warning"

    return {
        "id": str(hospital.id),
        "name": hospital.name,
        "region": hospital.region.name if hospital.region else None,
        "country": hospital.region.country if hospital.region else None,
        "position": {
            "x": hospital.position_x,
            "y": hospital.position_y,
        },
        "contact_email": hospital.contact_email,
        "is_active": hospital.is_active,
        "status": status,
        "active_alert_count": active_alert_count,
        "risk": _risk_payload(risk),
    }


def _inventory_payload(item: Inventory) -> dict:
    trend_label = {-1: "declining", 0: "stable", 1: "improving"}
    return {
        "id": str(item.id),
        "hospital_id": str(item.hospital_id),
        "resource_id": str(item.resource_id),
        "resource": item.resource.name if item.resource else None,
        "unit": item.resource.unit if item.resource else None,
        "current_level": round(item.current_level, 1),
        "capacity_total": item.capacity_total,
        "status": _enum_value(item.status),
        "trend": trend_label.get(item.trend, "stable"),
        "warning_threshold": item.resource.warning_threshold if item.resource else None,
        "critical_threshold": item.resource.critical_threshold if item.resource else None,
        "last_updated_at": _iso(item.last_updated_at),
    }


def _alert_payload(alert: Alert) -> dict:
    return {
        "id": str(alert.id),
        "hospital_id": str(alert.hospital_id),
        "hospital": alert.hospital.name if alert.hospital else None,
        "resource": alert.resource.name if alert.resource else None,
        "type": _enum_value(alert.alert_type),
        "severity": _enum_value(alert.severity),
        "message": alert.message,
        "status": _enum_value(alert.status),
        "created_at": _iso(alert.created_at),
        "resolved_at": _iso(alert.resolved_at),
    }


def _order_payload(order: ProcurementOrder) -> dict:
    return {
        "id": str(order.id),
        "hospital_id": str(order.hospital_id),
        "hospital": order.hospital.name if order.hospital else None,
        "supplier_id": str(order.supplier_id),
        "supplier": order.supplier.name if order.supplier else None,
        "resource": order.resource.name if order.resource else None,
        "quantity": order.quantity,
        "unit_price": float(order.unit_price),
        "total_cost": float(order.total_cost) if order.total_cost is not None else None,
        "status": _enum_value(order.status),
        "created_at": _iso(order.created_at),
        "estimated_delivery": _iso(order.estimated_delivery),
        "delivered_at": _iso(order.delivered_at),
        "notes": order.notes,
    }


def _demo_chat_fallback(req: ChatRequest, reason: str | None = None) -> ChatResponse:
    logger.warning("using demo chat fallback | reason=%s", reason or "not provided")
    response = (
        "Critical supply risk detected at AIIMS New Delhi.\n\n"
        "- Oxygen inventory is at 24%, which is below the 40% critical threshold.\n"
        "- ICU occupancy is 92.1%, indicating surge pressure.\n"
        "- Recommended supplier: AirSupply Corp, reliability 98%, 2-day lead time, "
        "unit price 4500.\n\n"
        "Recommended action: draft a procurement order for oxygen after human approval. "
        "Suggested demo order: 500 units from AirSupply Corp. Estimated total: 2250000."
    )
    return ChatResponse(
        response=response,
        tool_calls=[
            {"tool": "demo_fallback", "input": {"message": req.message, "reason": reason}},
        ],
        tokens_used=None,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "caresync-api"}


@app.get("/api/hospitals")
async def list_hospitals():
    """Return active hospitals with map coordinates, latest risk, and status."""
    with _db_session() as session:
        hospitals = session.scalars(
            select(Hospital)
            .where(Hospital.is_active.is_(True))
            .order_by(Hospital.name)
        ).all()

        payload = []
        for hospital in hospitals:
            inventory = session.scalars(
                select(Inventory).where(Inventory.hospital_id == hospital.id)
            ).all()
            risk = session.scalars(
                select(RiskScore)
                .where(RiskScore.hospital_id == hospital.id)
                .order_by(RiskScore.calculated_at.desc())
                .limit(1)
            ).first()
            active_alert_count = session.scalar(
                select(func.count(Alert.id)).where(
                    Alert.hospital_id == hospital.id,
                    Alert.status.in_(["open", "acknowledged"]),
                )
            )
            payload.append(
                _hospital_payload(
                    hospital,
                    inventory=list(inventory),
                    risk=risk,
                    active_alert_count=active_alert_count or 0,
                )
            )

    return {"hospitals": payload}


@app.get("/api/dashboard/summary")
async def dashboard_summary():
    """Return the command-center snapshot used by the frontend dashboard."""
    with _db_session() as session:
        hospitals = session.scalars(
            select(Hospital)
            .where(Hospital.is_active.is_(True))
            .order_by(Hospital.name)
        ).all()

        inventory_rows = session.scalars(select(Inventory)).all()
        alert_rows = session.scalars(
            select(Alert)
            .where(Alert.status.in_(["open", "acknowledged"]))
            .order_by(Alert.created_at.desc())
        ).all()
        latest_logs = session.scalars(
            select(AgentLog)
            .order_by(AgentLog.created_at.desc())
            .limit(10)
        ).all()

        risk_by_hospital = {
            row.hospital_id: row
            for row in session.scalars(
                select(RiskScore).order_by(RiskScore.calculated_at.asc())
            ).all()
        }

        inventory_by_hospital: dict[Any, list[Inventory]] = {}
        for item in inventory_rows:
            inventory_by_hospital.setdefault(item.hospital_id, []).append(item)

        resources = {}
        for item in inventory_rows:
            name = item.resource.name if item.resource else "unknown"
            resources.setdefault(name, []).append(item.current_level)

        average_resource_levels = {
            name: round(sum(values) / len(values), 1)
            for name, values in resources.items()
            if values
        }

        critical_inventory_count = sum(
            1 for item in inventory_rows if _enum_value(item.status) == "critical"
        )
        warning_inventory_count = sum(
            1 for item in inventory_rows if _enum_value(item.status) == "warning"
        )

        open_alert_count = sum(1 for item in alert_rows if _enum_value(item.status) == "open")
        critical_alert_count = sum(
            1 for item in alert_rows if _enum_value(item.severity) == "critical"
        )

        hospital_payloads = []
        for hospital in hospitals:
            hospital_alert_count = sum(
                1 for alert in alert_rows if alert.hospital_id == hospital.id
            )
            hospital_payloads.append(
                _hospital_payload(
                    hospital,
                    inventory=inventory_by_hospital.get(hospital.id, []),
                    risk=risk_by_hospital.get(hospital.id),
                    active_alert_count=hospital_alert_count,
                )
            )

        log_payloads = [
            {
                "id": str(log.id),
                "agent": log.agent.name if log.agent else None,
                "agent_type": _enum_value(log.agent.agent_type) if log.agent else None,
                "hospital": log.hospital.name if log.hospital else None,
                "severity": _enum_value(log.severity),
                "message": log.message,
                "metadata": log.metadata_,
                "created_at": _iso(log.created_at),
            }
            for log in latest_logs
        ]
        alert_payloads = [_alert_payload(alert) for alert in alert_rows[:10]]

    return {
        "totals": {
            "hospitals": len(hospitals),
            "active_alerts": len(alert_rows),
            "open_alerts": open_alert_count,
            "critical_alerts": critical_alert_count,
            "critical_inventory_items": critical_inventory_count,
            "warning_inventory_items": warning_inventory_count,
        },
        "average_resource_levels": average_resource_levels,
        "hospitals": hospital_payloads,
        "alerts": alert_payloads,
        "agent_logs": log_payloads,
    }


@app.get("/api/hospitals/{hospital_id}/inventory")
async def hospital_inventory(hospital_id: str):
    """Return inventory rows for a specific hospital."""
    hospital_uuid = _parse_uuid(hospital_id, "hospital_id")

    with _db_session() as session:
        hospital = session.get(Hospital, hospital_uuid)
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")

        inventory = session.scalars(
            select(Inventory)
            .where(Inventory.hospital_id == hospital_uuid)
            .join(Resource)
            .order_by(Inventory.current_level.asc())
        ).all()
        hospital_payload = _hospital_payload(hospital)
        inventory_payload = [_inventory_payload(item) for item in inventory]

    return {
        "hospital": hospital_payload,
        "inventory": inventory_payload,
    }


@app.get("/api/hospitals/{hospital_id}/alerts")
async def hospital_alerts(hospital_id: str, status: str = "active"):
    """Return alerts for a hospital. status=active includes open and acknowledged."""
    hospital_uuid = _parse_uuid(hospital_id, "hospital_id")

    with _db_session() as session:
        hospital = session.get(Hospital, hospital_uuid)
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")

        query = select(Alert).where(Alert.hospital_id == hospital_uuid)
        if status == "active":
            query = query.where(Alert.status.in_(["open", "acknowledged"]))
        elif status != "all":
            query = query.where(Alert.status == status)

        alerts = session.scalars(query.order_by(Alert.created_at.desc())).all()
        hospital_payload = _hospital_payload(hospital)
        alert_payloads = [_alert_payload(alert) for alert in alerts]

    return {
        "hospital": hospital_payload,
        "alerts": alert_payloads,
    }


@app.get("/api/hospitals/{hospital_id}/risk")
async def hospital_risk(hospital_id: str):
    """Return the latest risk score for a hospital."""
    hospital_uuid = _parse_uuid(hospital_id, "hospital_id")

    with _db_session() as session:
        hospital = session.get(Hospital, hospital_uuid)
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")

        risk = session.scalars(
            select(RiskScore)
            .where(RiskScore.hospital_id == hospital_uuid)
            .order_by(RiskScore.calculated_at.desc())
            .limit(1)
        ).first()
        hospital_payload = _hospital_payload(hospital, risk=risk)
        risk_payload = _risk_payload(risk)

    return {
        "hospital": hospital_payload,
        "risk": risk_payload,
    }


@app.get("/api/hospitals/{hospital_id}/orders")
async def hospital_orders(hospital_id: str, status: str = "all"):
    """Return recent procurement orders for a hospital."""
    hospital_uuid = _parse_uuid(hospital_id, "hospital_id")
    status_filter = _parse_order_status(status) if status != "all" else None

    with _db_session() as session:
        hospital = session.get(Hospital, hospital_uuid)
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")

        query = select(ProcurementOrder).where(ProcurementOrder.hospital_id == hospital_uuid)
        if status_filter:
            query = query.where(ProcurementOrder.status == status_filter)

        orders = session.scalars(
            query.order_by(ProcurementOrder.created_at.desc()).limit(20)
        ).all()
        hospital_payload = _hospital_payload(hospital)
        order_payloads = [_order_payload(order) for order in orders]

    return {
        "hospital": hospital_payload,
        "orders": order_payloads,
    }


@app.get("/api/agent-logs")
async def agent_logs(limit: int = 20, hospital_id: Optional[str] = None):
    """Return recent structured AI agent activity logs."""
    safe_limit = max(1, min(limit, 100))
    hospital_uuid = _parse_uuid(hospital_id, "hospital_id") if hospital_id else None

    with _db_session() as session:
        query = select(AgentLog).join(Agent)
        if hospital_uuid:
            query = query.where(AgentLog.hospital_id == hospital_uuid)

        logs = session.scalars(
            query.order_by(AgentLog.created_at.desc()).limit(safe_limit)
        ).all()
        log_payloads = [
            {
                "id": str(log.id),
                "agent_id": str(log.agent_id),
                "agent": log.agent.name if log.agent else None,
                "agent_type": _enum_value(log.agent.agent_type) if log.agent else None,
                "hospital_id": str(log.hospital_id) if log.hospital_id else None,
                "hospital": log.hospital.name if log.hospital else None,
                "severity": _enum_value(log.severity),
                "message": log.message,
                "metadata": log.metadata_,
                "created_at": _iso(log.created_at),
            }
            for log in logs
        ]

    return {"logs": log_payloads}


@app.get("/api/procurement/orders")
async def procurement_orders(
    hospital_id: Optional[str] = None,
    status: str = "all",
    limit: int = 20,
):
    """Return recent procurement orders across hospitals or scoped to one hospital."""
    safe_limit = max(1, min(limit, 100))
    hospital_uuid = _parse_uuid(hospital_id, "hospital_id") if hospital_id else None
    status_filter = _parse_order_status(status) if status != "all" else None

    with _db_session() as session:
        query = select(ProcurementOrder)
        if hospital_uuid:
            query = query.where(ProcurementOrder.hospital_id == hospital_uuid)
        if status_filter:
            query = query.where(ProcurementOrder.status == status_filter)

        orders = session.scalars(
            query.order_by(ProcurementOrder.created_at.desc()).limit(safe_limit)
        ).all()
        order_payloads = [_order_payload(order) for order in orders]

    return {"orders": order_payloads}


@app.post("/api/procurement/orders", status_code=201)
async def create_procurement_order(req: ProcurementOrderCreate):
    """Create a DRAFT procurement order after validating supplier availability."""
    hospital_uuid = _parse_uuid(req.hospital_id, "hospital_id")
    supplier_uuid = _parse_uuid(req.supplier_id, "supplier_id")
    created_by_uuid = _parse_uuid(req.created_by, "created_by") if req.created_by else None

    with _db_session() as session:
        hospital = session.get(Hospital, hospital_uuid)
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")

        supplier = session.get(Supplier, supplier_uuid)
        if not supplier or not supplier.is_active:
            raise HTTPException(status_code=404, detail="Active supplier not found")

        resource = _get_resource_for_order(
            session,
            resource_id=req.resource_id,
            resource_name=req.resource_name,
        )

        supplier_resource = session.scalars(
            select(SupplierResource).where(
                SupplierResource.supplier_id == supplier_uuid,
                SupplierResource.resource_id == resource.id,
            )
        ).first()
        if not supplier_resource:
            raise HTTPException(
                status_code=400,
                detail=f"{supplier.name} does not supply {resource.name}",
            )
        if supplier_resource.available_quantity < req.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Supplier has {supplier_resource.available_quantity} units "
                    f"available; requested {req.quantity}."
                ),
            )

        estimated_delivery = req.estimated_delivery
        if not estimated_delivery and supplier.lead_time_days:
            estimated_delivery = date.today() + timedelta(days=supplier.lead_time_days)

        order = ProcurementOrder(
            hospital_id=hospital_uuid,
            supplier_id=supplier_uuid,
            resource_id=resource.id,
            quantity=req.quantity,
            unit_price=supplier_resource.unit_price,
            status=OrderStatus.draft,
            created_by=created_by_uuid,
            estimated_delivery=estimated_delivery,
            notes=req.notes,
        )
        session.add(order)
        session.commit()
        session.refresh(order)
        order_payload = _order_payload(order)

    return {
        "order": order_payload,
        "message": "Draft procurement order created. Human approval required before submission.",
    }


@app.patch("/api/procurement/orders/{order_id}/status")
async def update_procurement_order_status(
    order_id: str,
    req: ProcurementOrderStatusUpdate,
):
    """Update procurement order status for the approval/submission demo flow."""
    order_uuid = _parse_uuid(order_id, "order_id")
    next_status = _parse_order_status(req.status)

    with _db_session() as session:
        order = session.get(ProcurementOrder, order_uuid)
        if not order:
            raise HTTPException(status_code=404, detail="Procurement order not found")

        order.status = next_status
        session.commit()
        session.refresh(order)
        order_payload = _order_payload(order)

    return {"order": order_payload}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Main AI Copilot endpoint — runs the Procurement Agent and returns
    its response along with any tool calls it made.
    """
    logger.info(
        "chat request | hospital=%s session=%s message_len=%d",
        req.hospital_id,
        req.session_id,
        len(req.message),
    )

    if not os.getenv("ANTHROPIC_API_KEY"):
        return _demo_chat_fallback(req, reason="ANTHROPIC_API_KEY is not configured")

    try:
        from agents.procurement_agent import run_procurement_agent

        result = await run_procurement_agent(
            user_message=req.message,
            history=[m.model_dump() for m in req.history],
            hospital_id=req.hospital_id,
            user_id=req.user_id,
            session_id=req.session_id,
        )
    except Exception as exc:
        logger.exception("procurement agent failed")
        return _demo_chat_fallback(req, reason=str(exc))

    if str(result.get("response", "")).startswith("I encountered an error"):
        return _demo_chat_fallback(req, reason=result["response"])

    return ChatResponse(
        response=result["response"],
        tool_calls=result.get("tool_calls", []),
        tokens_used=result.get("tokens_used"),
    )
