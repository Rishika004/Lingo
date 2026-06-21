import pytest
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from agents.orchestrator import AgentState
from agents.intake_agent import intake_node
import asyncio


def run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_github_url_classified_correctly():
    state = AgentState(
        input_type="github",
        input_value="https://github.com/user/repo",
        audience="engineer",
        tone="professional",
    )
    result = run(intake_node(state))
    assert result.enriched_facts["input_type"] == "github"
    assert result.enriched_facts["raw_value"] == "https://github.com/user/repo"
    assert result.enriched_facts["owner"] == "user"
    assert result.enriched_facts["repo"] == "repo"


def test_text_input_classified_correctly():
    state = AgentState(
        input_type="text",
        input_value="I just finished my internship at Google",
        audience="jobseeker",
        tone="casual",
    )
    result = run(intake_node(state))
    assert result.enriched_facts["input_type"] == "text"
    assert result.enriched_facts["raw_value"] == "I just finished my internship at Google"


def test_image_input_classified_correctly():
    state = AgentState(
        input_type="image",
        input_value="data:image/png;base64,abc123",
        audience="founder",
        tone="bold",
    )
    result = run(intake_node(state))
    assert result.enriched_facts["input_type"] == "image"
    assert result.enriched_facts["raw_value"] == "data:image/png;base64,abc123"


def test_invalid_github_url_adds_error():
    state = AgentState(
        input_type="github",
        input_value="not-a-github-url",
        audience="engineer",
        tone="professional",
    )
    result = run(intake_node(state))
    assert len(result.errors) > 0
