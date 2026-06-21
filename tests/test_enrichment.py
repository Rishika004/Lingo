import pytest
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from unittest.mock import patch, AsyncMock
from agents.orchestrator import AgentState
from agents.enrichment_agent import enrichment_node
import asyncio


def run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def test_github_enrichment_calls_github_tool():
    state = AgentState(
        input_type="github",
        input_value="https://github.com/user/repo",
        audience="engineer",
        tone="professional",
        enriched_facts={
            "input_type": "github",
            "raw_value": "https://github.com/user/repo",
            "owner": "user",
            "repo": "repo",
        }
    )
    mock_repo_data = {
        "name": "repo",
        "description": "A cool tool",
        "language": "Python",
        "stars": 42,
        "topics": ["ai", "python"],
        "readme_excerpt": "This tool does amazing things",
        "repo_url": "https://github.com/user/repo",
    }
    with patch('agents.enrichment_agent.fetch_github_repo', new_callable=AsyncMock) as mock_gh:
        mock_gh.return_value = mock_repo_data
        result = run(enrichment_node(state))
    assert result.enriched_facts["github"] == mock_repo_data
    assert result.enriched_facts["summary"] != ""


def test_text_enrichment_populates_summary():
    state = AgentState(
        input_type="text",
        input_value="I completed my ML internship",
        audience="jobseeker",
        tone="casual",
        enriched_facts={
            "input_type": "text",
            "raw_value": "I completed my ML internship",
        }
    )
    result = run(enrichment_node(state))
    assert "summary" in result.enriched_facts
    assert "I completed my ML internship" in result.enriched_facts["summary"]
