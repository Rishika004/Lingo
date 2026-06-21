import pytest
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from unittest.mock import patch, MagicMock
from agents.orchestrator import AgentState
from agents.critic_agent import critic_node
import asyncio


def run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def test_critic_adds_scores_to_variants():
    state = AgentState(
        input_type="text",
        input_value="test",
        audience="founder",
        tone="bold",
        variants=[
            {"text": "Variant 1"},
            {"text": "Variant 2"},
            {"text": "Variant 3"},
        ]
    )
    mock_response = MagicMock()
    mock_response.text = '[{"score": 8, "improvement": "Add a stronger hook"}, {"score": 7, "improvement": "Include a metric"}, {"score": 6, "improvement": "Shorten the CTA"}]'

    with patch('agents.critic_agent.genai') as mock_genai:
        mock_client = MagicMock()
        mock_genai.Client.return_value = mock_client
        mock_client.models.generate_content.return_value = mock_response
        result = run(critic_node(state))

    assert result.variants[0]["score"] == 8
    assert result.variants[1]["score"] == 7
    assert result.variants[2]["score"] == 6
    assert result.best_index == 0
    assert "improvement" in result.variants[0]


def test_critic_skips_if_no_variants():
    state = AgentState(
        input_type="text",
        input_value="test",
        audience="founder",
        tone="bold",
        variants=[]
    )
    result = run(critic_node(state))
    assert result.variants == []
    assert len(result.errors) > 0
