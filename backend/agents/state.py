"""
CareSync AI — LangGraph shared state definitions.

CareSyncState is the base state used by all agents. It extends
LangGraph's MessagesState with hospital/user context so every node
in the graph has access to the operational context without passing
it through tool arguments.
"""

from __future__ import annotations

from typing import Annotated, Optional, Sequence

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class CareSyncState(TypedDict):
    """
    Shared state flowing through the LangGraph agent nodes.

    messages:    Append-only conversation history managed by LangGraph's
                 add_messages reducer. Contains HumanMessage, AIMessage,
                 and ToolMessage instances.

    hospital_id: UUID of the hospital currently in focus. Injected at
                 session start from the authenticated user's context.
                 Can be None for system-level admin sessions.

    user_id:     UUID of the authenticated user (maps to users.id in PG).
                 Used for audit logging and role-based tool restrictions.

    session_id:  UUID of the chat_sessions row in PostgreSQL.
                 Used to persist messages and load/save MongoDB chat_context.
    """

    messages: Annotated[Sequence[BaseMessage], add_messages]
    hospital_id: Optional[str]
    user_id: Optional[str]
    session_id: Optional[str]
