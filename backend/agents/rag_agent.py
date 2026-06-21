"""
RAG Agent Node.
Retrieves the 5 most similar posts from the style_library using pgvector.
Uses the enriched summary as the search query.
"""

from postcraft.backend.agents.orchestrator import AgentState
from postcraft.backend.memory.supabase_rag import retrieve_similar_posts


async def rag_node(state: AgentState) -> AgentState:
    print(f"\n[rag] Retrieving style examples | audience={state.audience}")

    summary = state.enriched_facts.get("summary", "")
    if not summary:
        print("[rag] No summary available — skipping RAG")
        return state

    try:
        posts = retrieve_similar_posts(
            query=summary,
            audience=state.audience,
            limit=5,
        )
        state.style_examples = posts
        print(f"[rag] Retrieved {len(posts)} style examples")
    except Exception as e:
        state.errors.append(f"rag_node: {str(e)}")
        print(f"[rag] RAG failed: {e} — continuing without examples")
        state.style_examples = []

    return state
