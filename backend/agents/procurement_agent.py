"""
CareSync AI — Procurement Agent (LangGraph)

Uses LangGraph's create_react_agent to build a ReAct loop backed by
Claude claude-sonnet-4-6 and the six procurement tools.

Public API:
    create_procurement_graph()   → compiled LangGraph (reuse across requests)
    run_procurement_agent(...)   → async helper for FastAPI endpoints
"""

from __future__ import annotations

import logging
import os
from typing import AsyncIterator, Optional

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langgraph.prebuilt import create_react_agent

from tools.procurement_tools import PROCUREMENT_TOOLS

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are the CareSync AI Procurement Agent — an autonomous \
supply chain intelligence assistant for a national healthcare operations center.

You are currently assisting medical staff in managing critical healthcare \
resources across a network of hospitals in India. Your primary user is \
Dr. Sarah Chen, Chief Medical Officer.

## Your capabilities
You have access to the following tools:
- **get_hospital_metrics**: Retrieve real-time oxygen, ICU, and pharma levels for a hospital
- **get_inventory_status**: Get detailed resource inventory with status and trends
- **search_suppliers**: Find and rank suppliers for a specific resource type
- **get_active_alerts**: View open shortage and threshold alerts for a hospital
- **create_procurement_order**: Draft a purchase order (stays as DRAFT for human approval)
- **get_procurement_orders**: Review existing procurement orders and their status

## Operational guidelines
1. **Always check inventory before recommending procurement** — call get_inventory_status first.
2. **Prioritize by severity** — critical resources (oxygen < 40%, ICU > 85%) take precedence.
3. **Recommend the highest-reliability supplier** — sort by reliability score, flag logistics risk.
4. **Draft orders only** — all orders you create are DRAFT status. Remind the user that human
   approval is required before any order is submitted to a supplier.
5. **Be specific and actionable** — include quantities, costs, lead times, and order IDs in responses.
6. **Flag anomalies** — if inventory is declining rapidly or multiple resources are in warning/critical,
   escalate the urgency in your response.

## Procurement order creation rules
Before calling create_procurement_order, you must have explicit user confirmation
for every required order field:
- hospital or hospital_id
- resource
- quantity
- supplier selected from search_suppliers results
- unit price, estimated total, and lead time shown to the user
- optional notes/justification, or an explicit decision to leave notes blank

If any required field is missing, ambiguous, or inferred from context, ask concise
follow-up questions instead of calling create_procurement_order. Never guess the
quantity, supplier, hospital, resource, or notes. Never choose a supplier silently:
present the recommended supplier and ask the user to confirm. Only set the tool's
user_confirmed argument to true after the user has explicitly approved the exact
draft order details in the conversation.

## Response style
- Be concise and clinical. You are talking to medical operations staff, not general users.
- Lead with the most critical information first.
- Use numbers: percentages, quantities, costs, lead times.
- When creating an order, always confirm the order ID and estimated total cost.
- Never make up data — only use information returned by your tools.
"""


def _build_system_message(hospital_id: Optional[str] = None) -> SystemMessage:
    """Inject hospital context into the system prompt if available."""
    content = SYSTEM_PROMPT
    if hospital_id:
        content += f"\n\n## Current hospital context\nHospital ID in focus: {hospital_id}\nWhen the user says 'this hospital' or 'here', use this hospital ID."
    return SystemMessage(content=content)


# ---------------------------------------------------------------------------
# Graph factory
# ---------------------------------------------------------------------------

def create_procurement_graph(hospital_id: Optional[str] = None):
    """Build and compile the procurement ReAct agent graph.

    Args:
        hospital_id: Optional hospital UUID to inject into the system prompt.
                     Pass this at session creation time when the user's
                     hospital affiliation is known.

    Returns:
        Compiled LangGraph CompiledGraph ready to invoke or stream.

    Usage:
        graph = create_procurement_graph(hospital_id="b100...")
        result = graph.invoke({"messages": [HumanMessage(content="...")]})
    """
    llm = ChatAnthropic(
        model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
        temperature=0,
        api_key=os.getenv("ANTHROPIC_API_KEY"),
    )

    system_message = _build_system_message(hospital_id)

    graph = create_react_agent(
        model=llm,
        tools=PROCUREMENT_TOOLS,
        # prompt injects the system message before every LLM call.
        prompt=system_message,
    )

    return graph


# ---------------------------------------------------------------------------
# Async helper for FastAPI
# ---------------------------------------------------------------------------

async def run_procurement_agent(
    user_message: str,
    history: list[dict],
    hospital_id: Optional[str] = None,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
) -> dict:
    """Run the procurement agent for a single user turn.

    Args:
        user_message: Latest message from the user.
        history:      Previous messages as list of {"role": ..., "content": ...} dicts.
                      Converted to LangChain message objects internally.
        hospital_id:  Optional hospital UUID for context.
        user_id:      Optional user UUID for audit logging.
        session_id:   Optional chat session UUID.

    Returns:
        {
          "response": str,          # agent's final text reply
          "tool_calls": list[dict], # tools invoked during this turn
          "tokens_used": int | None
        }
    """
    from langchain_core.messages import AIMessage, HumanMessage

    graph = create_procurement_graph(hospital_id=hospital_id)

    # Convert history dicts to LangChain message objects
    messages = []
    for msg in history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=user_message))

    config: RunnableConfig = {
        "configurable": {
            "user_id": user_id,
            "session_id": session_id,
        }
    }

    try:
        result = await graph.ainvoke({"messages": messages}, config=config)
    except Exception as exc:
        logger.exception("Procurement agent invocation failed")
        return {
            "response": f"I encountered an error processing your request: {exc}",
            "tool_calls": [],
            "tokens_used": None,
        }

    # Extract final AI message
    final_message = result["messages"][-1]
    response_text = final_message.content if hasattr(final_message, "content") else str(final_message)

    # Collect tool call names for logging/audit
    tool_calls = [
        {"tool": msg.name, "input": msg.content}
        for msg in result["messages"]
        if hasattr(msg, "name") and msg.name  # ToolMessage instances
    ]

    # Extract token usage if available
    tokens_used = None
    if hasattr(final_message, "usage_metadata") and final_message.usage_metadata:
        tokens_used = final_message.usage_metadata.get("total_tokens")

    return {
        "response": response_text,
        "tool_calls": tool_calls,
        "tokens_used": tokens_used,
    }


async def stream_procurement_agent(
    user_message: str,
    history: list[dict],
    hospital_id: Optional[str] = None,
) -> AsyncIterator[str]:
    """Stream the procurement agent response token by token.
    Yields text chunks as they arrive from Claude.

    Usage (FastAPI streaming endpoint):
        async for chunk in stream_procurement_agent(...):
            yield f"data: {chunk}\\n\\n"
    """
    from langchain_core.messages import AIMessage, HumanMessage

    graph = create_procurement_graph(hospital_id=hospital_id)

    messages = []
    for msg in history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
    messages.append(HumanMessage(content=user_message))

    async for event in graph.astream(
        {"messages": messages},
        stream_mode="messages",
    ):
        # event is a tuple: (message_chunk, metadata)
        message_chunk, metadata = event
        if hasattr(message_chunk, "content") and message_chunk.content:
            # Only yield text from the final AI response, not tool calls
            if metadata.get("langgraph_node") == "agent":
                yield message_chunk.content
