"""
PostCraft agent orchestrator.

Defines AgentState and the LangGraph StateGraph:
intake -> enrichment -> rag -> writer -> critic -> END
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from langgraph.graph import END, StateGraph


class AgentState(BaseModel):
    # ── Inputs ────────────────────────────────────────────────────────────────
    input_type: str = Field(..., description="github | image | text")
    input_value: str = Field(..., description="URL, base64 image, or raw text")
    audience: str = Field(..., description="founder | engineer | jobseeker | recruiter")
    tone: str = Field(..., description="professional | casual | storytelling | bold")
    voice_samples: List[str] = Field(default_factory=list, description="User's own past posts")

    # ── Pipeline state ────────────────────────────────────────────────────────
    enriched_facts: Dict[str, Any] = Field(default_factory=dict)
    style_examples: List[Dict[str, Any]] = Field(default_factory=list)
    variants: List[Dict[str, Any]] = Field(default_factory=list)
    best_index: int = Field(default=0)
    errors: List[str] = Field(default_factory=list)

    class Config:
        arbitrary_types_allowed = True


def build_graph() -> StateGraph:
    from postcraft.backend.agents.intake_agent import intake_node
    from postcraft.backend.agents.enrichment_agent import enrichment_node
    from postcraft.backend.agents.rag_agent import rag_node
    from postcraft.backend.agents.writer_agent import writer_node
    from postcraft.backend.agents.critic_agent import critic_node

    graph = StateGraph(AgentState)

    graph.add_node("intake", intake_node)
    graph.add_node("enrichment", enrichment_node)
    graph.add_node("rag", rag_node)
    graph.add_node("writer", writer_node)
    graph.add_node("critic", critic_node)

    graph.set_entry_point("intake")
    graph.add_edge("intake", "enrichment")
    graph.add_edge("enrichment", "rag")
    graph.add_edge("rag", "writer")
    graph.add_edge("writer", "critic")
    graph.add_edge("critic", END)

    return graph.compile()


_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph
