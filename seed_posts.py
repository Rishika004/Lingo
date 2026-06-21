"""
One-time script to embed posts.json and store in Supabase style_library.
Run once: python seed_posts.py
"""

import json
import os
import sys

from dotenv import load_dotenv
load_dotenv()

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from google import genai as google_genai
from supabase import create_client


def embed_text(text: str) -> list[float]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY must be set")
    client = google_genai.Client(api_key=api_key)
    result = client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=text,
        config=google_genai.types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=768,
        ),
    )
    return list(result.embeddings[0].values)


def seed():
    posts_path = os.path.join(os.path.dirname(__file__), '..', 'posts.json')
    with open(posts_path, "r", encoding="utf-8") as f:
        posts = json.load(f)

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    supabase = create_client(url, key)

    print(f"Seeding {len(posts)} posts into style_library...")

    for i, post in enumerate(posts):
        try:
            embedding = embed_text(post["text"])
            supabase.table("style_library").insert({
                "text": post["text"],
                "audience": post["audience"],
                "tone": post["tone"],
                "embedding": embedding,
            }).execute()
            preview = post['text'][:60].encode('ascii', errors='replace').decode()
            print(f"[{i+1}/{len(posts)}] OK: {preview}...")
        except Exception as e:
            print(f"[{i+1}/{len(posts)}] FAIL: {e}".encode('ascii', errors='replace').decode())

    print("Seeding complete.")


if __name__ == "__main__":
    seed()
