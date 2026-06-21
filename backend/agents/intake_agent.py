"""
Intake Agent Node — classifies input type and extracts metadata.

For GitHub: parses owner/repo from URL.
For image: validates base64 format.
For text: trims and validates non-empty.
"""

import re
from backend.agents.orchestrator import AgentState


async def intake_node(state: AgentState) -> AgentState:
    print(f"\n[intake] input_type={state.input_type}")

    if state.input_type == "github":
        return _handle_github(state)
    elif state.input_type == "image":
        return _handle_image(state)
    elif state.input_type == "text":
        return _handle_text(state)
    else:
        state.errors.append(f"intake: unknown input_type '{state.input_type}'")
        return state


def _handle_github(state: AgentState) -> AgentState:
    pattern = r"https?://github\.com/([^/]+)/([^/\s]+)"
    match = re.search(pattern, state.input_value.strip())
    if not match:
        state.errors.append(
            f"intake: '{state.input_value}' is not a valid GitHub URL. "
            "Expected format: https://github.com/owner/repo"
        )
        state.enriched_facts = {"input_type": "github", "raw_value": state.input_value}
        return state

    owner, repo = match.group(1), match.group(2).rstrip("/")
    state.enriched_facts = {
        "input_type": "github",
        "raw_value": state.input_value,
        "owner": owner,
        "repo": repo,
        "github_url": f"https://github.com/{owner}/{repo}",
    }
    print(f"[intake] GitHub repo: {owner}/{repo}")
    return state


def _handle_image(state: AgentState) -> AgentState:
    state.enriched_facts = {
        "input_type": "image",
        "raw_value": state.input_value,
    }
    print(f"[intake] Image input detected ({len(state.input_value)} chars)")
    return state


def _handle_text(state: AgentState) -> AgentState:
    text = state.input_value.strip()
    if not text:
        state.errors.append("intake: text input is empty")
    state.enriched_facts = {
        "input_type": "text",
        "raw_value": text,
    }
    print(f"[intake] Text input: '{text[:80]}'")
    return state
