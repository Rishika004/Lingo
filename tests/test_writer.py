import pytest
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from unittest.mock import patch, MagicMock
from agents.orchestrator import AgentState
from agents.writer_agent import writer_node, _build_writer_prompt
import asyncio


def run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def test_build_writer_prompt_contains_audience():
    state = AgentState(
        input_type="text",
        input_value="I built an AI tool",
        audience="founder",
        tone="bold",
        enriched_facts={"summary": "I built an AI tool that automates LinkedIn posts"},
        style_examples=[{"text": "Example post 1"}, {"text": "Example post 2"}],
    )
    prompt = _build_writer_prompt(state)
    assert "founder" in prompt.lower()
    assert "bold" in prompt.lower()
    assert "Example post 1" in prompt


def test_writer_node_produces_3_variants():
    state = AgentState(
        input_type="text",
        input_value="I built an AI tool",
        audience="engineer",
        tone="professional",
        enriched_facts={"summary": "Built a RAG pipeline"},
        style_examples=[],
    )
    mock_response = MagicMock()
    mock_response.text = '[{"text": "Variant 1 post text here"}, {"text": "Variant 2 post text here"}, {"text": "Variant 3 post text here"}]'

    with patch('agents.writer_agent.genai') as mock_genai:
        mock_client = MagicMock()
        mock_genai.Client.return_value = mock_client
        mock_client.models.generate_content.return_value = mock_response
        result = run(writer_node(state))

    assert len(result.variants) == 3
    assert result.variants[0]["text"] == "Variant 1 post text here"
