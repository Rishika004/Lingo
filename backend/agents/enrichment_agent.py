"""
Enrichment Agent Node.

Routes to the correct enrichment strategy based on input_type:
- github: calls GitHub API to get repo metadata + README
- image: calls Gemini Vision to extract facts
- text: cleans and structures the raw text input
"""

from postcraft.backend.agents.orchestrator import AgentState
from postcraft.backend.tools.github_tool import fetch_github_repo
from postcraft.backend.tools.vision_tool import analyze_image


async def enrichment_node(state: AgentState) -> AgentState:
    print(f"\n[enrichment] input_type={state.enriched_facts.get('input_type')}")

    input_type = state.enriched_facts.get("input_type", state.input_type)

    if input_type == "github":
        return await _enrich_github(state)
    elif input_type == "image":
        return await _enrich_image(state)
    else:
        return _enrich_text(state)


async def _enrich_github(state: AgentState) -> AgentState:
    owner = state.enriched_facts.get("owner", "")
    repo = state.enriched_facts.get("repo", "")

    if not owner or not repo:
        state.errors.append("enrichment: missing owner/repo from intake")
        return state

    try:
        repo_data = await fetch_github_repo(owner, repo)
        state.enriched_facts["github"] = repo_data

        summary_parts = [f"GitHub project: {repo_data['name']}"]
        if repo_data.get("description"):
            summary_parts.append(f"Description: {repo_data['description']}")
        if repo_data.get("language"):
            summary_parts.append(f"Primary language: {repo_data['language']}")
        if repo_data.get("stars"):
            summary_parts.append(f"GitHub stars: {repo_data['stars']}")
        if repo_data.get("topics"):
            summary_parts.append(f"Topics: {', '.join(repo_data['topics'])}")
        if repo_data.get("readme_excerpt"):
            summary_parts.append(f"README excerpt:\n{repo_data['readme_excerpt'][:800]}")

        state.enriched_facts["summary"] = "\n".join(summary_parts)
        print(f"[enrichment] GitHub enrichment complete: {owner}/{repo}")

    except Exception as e:
        state.errors.append(f"enrichment (github): {str(e)}")
        state.enriched_facts["summary"] = f"GitHub project: {owner}/{repo}"

    return state


async def _enrich_image(state: AgentState) -> AgentState:
    image_b64 = state.enriched_facts.get("raw_value", "")

    try:
        vision_data = await analyze_image(image_b64)
        state.enriched_facts["vision"] = vision_data

        summary_parts = []
        if vision_data.get("description"):
            summary_parts.append(f"Image shows: {vision_data['description']}")
        if vision_data.get("achievement"):
            summary_parts.append(f"Achievement: {vision_data['achievement']}")
        if vision_data.get("key_facts"):
            summary_parts.append(f"Key facts: {', '.join(vision_data['key_facts'])}")
        if vision_data.get("suggested_topic"):
            summary_parts.append(f"Suggested topic: {vision_data['suggested_topic']}")

        state.enriched_facts["summary"] = "\n".join(summary_parts) if summary_parts else "Image input"
        print(f"[enrichment] Vision enrichment complete")

    except Exception as e:
        state.errors.append(f"enrichment (vision): {str(e)}")
        state.enriched_facts["summary"] = "Image input"

    return state


def _enrich_text(state: AgentState) -> AgentState:
    raw = state.enriched_facts.get("raw_value", "").strip()
    state.enriched_facts["summary"] = raw
    print(f"[enrichment] Text enrichment: '{raw[:80]}'")
    return state
