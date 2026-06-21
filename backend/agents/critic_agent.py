"""
Critic Agent Node — fast heuristic scorer (no LLM call).
Scores variants instantly based on hook strength, structure, and CTA presence.
"""

from backend.agents.orchestrator import AgentState

_HOOK_WORDS = {"i ", "we ", "you ", "here's", "why ", "how ", "what ", "the truth", "stop ", "unpopular", "honest"}
_CTA_WORDS = {"comment", "dm", "follow", "share", "thoughts", "let me know", "reach out", "connect"}
_TIPS = [
    "Add a stronger opening line that creates curiosity.",
    "Break longer paragraphs into single-line punches.",
    "End with a clearer call-to-action.",
]


def _score(text: str, idx: int) -> tuple[int, str]:
    lines = [l.strip() for l in text.strip().splitlines() if l.strip()]
    if not lines:
        return 4, _TIPS[idx % 3]

    hook = lines[0].lower()
    hook_score = 3 if any(w in hook for w in _HOOK_WORDS) else 1
    structure_score = 2 if len(lines) >= 5 else 1
    cta_score = 2 if any(w in text.lower() for w in _CTA_WORDS) else 0
    length_score = 2 if 100 < len(text.split()) < 320 else 1

    total = min(10, hook_score + structure_score + cta_score + length_score + 2)
    tip = _TIPS[idx % 3]
    return total, tip


async def critic_node(state: AgentState) -> AgentState:
    print(f"\n[critic] Scoring {len(state.variants)} variants (heuristic)")

    if not state.variants:
        state.errors.append("critic_node: no variants to score")
        return state

    for i, variant in enumerate(state.variants):
        score, tip = _score(variant.get("text", ""), i)
        state.variants[i]["score"] = score
        state.variants[i]["improvement"] = tip

    state.best_index = max(range(len(state.variants)), key=lambda i: state.variants[i].get("score", 0))
    print(f"[critic] Scores: {[v.get('score') for v in state.variants]} | Best: variant {state.best_index + 1}")
    return state
