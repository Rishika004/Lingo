"""
Tests for PostCraft FastAPI endpoints.
"""

from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

import postcraft.backend.main as main
from postcraft.backend.main import app

client = TestClient(app)

MOCK_GRAPH_RESULT = {
    "variants": [
        {"text": "post1", "score": 8, "improvement": "tip1"},
        {"text": "post2", "score": 7, "improvement": "tip2"},
        {"text": "post3", "score": 6, "improvement": "tip3"},
    ],
    "best_index": 0,
    "errors": [],
    "input_type": "text",
    "audience": "founder",
    "tone": "bold",
    "input_value": "test",
    "voice_samples": [],
    "enriched_facts": {},
    "style_examples": [],
}


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_generate_returns_variants():
    mock_graph = MagicMock()
    mock_graph.invoke.return_value = MOCK_GRAPH_RESULT

    with (
        patch.object(main, "get_graph", return_value=mock_graph),
        patch.object(main, "store_draft"),
        patch.object(main, "log_event"),
    ):
        response = client.post(
            "/generate",
            json={
                "input_type": "text",
                "input_value": "test",
                "audience": "founder",
                "tone": "bold",
                "voice_samples": [],
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert "variants" in data
    assert "best_index" in data
    assert "generation_time_ms" in data
    assert len(data["variants"]) == 3
    assert data["best_index"] == 0
