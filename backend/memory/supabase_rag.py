"""
Supabase pgvector RAG client.
Embeds queries with Google gemini-embedding-001 (3072 dimensions) and retrieves
similar posts from the style_library table.
"""

import os
from functools import lru_cache
from typing import Any, Dict, List, Optional

from google import genai as google_genai
from supabase import create_client, Client


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    return create_client(url, key)


def embed_text(text: str) -> List[float]:
    """Embed text using Google text-embedding-004 (768 dimensions)."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY must be set")
    client = google_genai.Client(api_key=api_key)
    result = client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=text,
        config=google_genai.types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=768,
        ),
    )
    return list(result.embeddings[0].values)


def retrieve_similar_posts(
    query: str,
    audience: str,
    limit: int = 5,
) -> List[Dict[str, Any]]:
    """
    Embed the query and return the most similar posts from style_library.
    Filters by audience type. Returns empty list on any error.
    """
    print(f"[rag] Retrieving similar posts | audience={audience} | query='{query[:60]}'")
    try:
        embedding = embed_text(query)
        client = get_supabase_client()

        response = client.rpc(
            "match_style_posts",
            {
                "query_embedding": embedding,
                "audience_filter": audience,
                "match_count": limit,
            },
        ).execute()

        posts = response.data or []
        print(f"[rag] Retrieved {len(posts)} similar posts")
        return posts

    except Exception as e:
        print(f"[rag] RAG retrieval failed: {e}")
        return []


def store_draft(
    input_type: str,
    audience: str,
    tone: str,
    variants: List[Dict[str, Any]],
    best_index: int,
    generation_time_ms: int,
) -> Optional[str]:
    """Store a generated draft to generated_drafts table. Returns the draft ID."""
    try:
        client = get_supabase_client()
        response = client.table("generated_drafts").insert({
            "input_type": input_type,
            "audience": audience,
            "tone": tone,
            "variants": variants,
            "best_index": best_index,
            "generation_time_ms": generation_time_ms,
        }).execute()
        return response.data[0]["id"] if response.data else None
    except Exception as e:
        print(f"[rag] Failed to store draft: {e}")
        return None


def log_event(
    event: str,
    input_type: str = "",
    audience: str = "",
    generation_time_ms: int = 0,
    error: str = "",
) -> None:
    """Log a usage event to usage_logs table."""
    try:
        client = get_supabase_client()
        client.table("usage_logs").insert({
            "event": event,
            "input_type": input_type,
            "audience": audience,
            "generation_time_ms": generation_time_ms,
            "error": error,
        }).execute()
    except Exception as e:
        print(f"[rag] Failed to log event: {e}")
