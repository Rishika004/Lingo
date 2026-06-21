import pytest
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from unittest.mock import patch, MagicMock
from memory.supabase_rag import embed_text, retrieve_similar_posts


def test_embed_text_returns_list_of_floats():
    with patch('memory.supabase_rag.google_genai') as mock_genai, \
         patch('memory.supabase_rag.os.getenv') as mock_getenv:
        mock_getenv.return_value = "fake-api-key"
        mock_embedding = MagicMock()
        mock_embedding.values = [0.1] * 768
        mock_genai.Client.return_value.models.embed_content.return_value.embeddings = [mock_embedding]
        result = embed_text("test text")
        assert isinstance(result, list)
        assert len(result) == 768
        assert all(isinstance(x, float) for x in result)


def test_retrieve_similar_posts_returns_list():
    with patch('memory.supabase_rag.get_supabase_client') as mock_client_fn:
        mock_client = MagicMock()
        mock_client_fn.return_value = mock_client
        mock_client.rpc.return_value.execute.return_value.data = [
            {"text": "post 1", "audience": "founder", "tone": "bold"},
            {"text": "post 2", "audience": "founder", "tone": "professional"},
        ]
        with patch('memory.supabase_rag.embed_text', return_value=[0.1] * 768):
            results = retrieve_similar_posts(
                query="I built an AI tool",
                audience="founder",
                limit=5
            )
        assert isinstance(results, list)
        assert len(results) == 2
        assert results[0]["text"] == "post 1"


def test_retrieve_similar_posts_returns_empty_on_error():
    with patch('memory.supabase_rag.get_supabase_client') as mock_client_fn:
        mock_client_fn.side_effect = Exception("Supabase unavailable")
        with patch('memory.supabase_rag.embed_text', return_value=[0.1] * 768):
            results = retrieve_similar_posts(
                query="test",
                audience="engineer",
                limit=5
            )
        assert results == []
