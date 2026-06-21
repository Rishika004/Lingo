"""
Gemini Vision tool.
Analyzes an uploaded image and extracts key facts for LinkedIn post generation.
Accepts base64-encoded image strings.
"""

import base64
import json
import os
from typing import Any, Dict

from google import genai
from google.genai import types


async def analyze_image(image_base64: str) -> Dict[str, Any]:
    """
    Send image to Gemini Vision and extract structured facts.

    Args:
        image_base64: Base64 encoded image (with or without data URI prefix).

    Returns:
        dict with keys: description, key_facts, suggested_topic, achievement
    """
    print("[vision_tool] Analyzing image with Gemini Vision")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _empty_vision_result("GEMINI_API_KEY not set")

    # Strip data URI prefix if present
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception as e:
        return _empty_vision_result(f"Invalid base64: {e}")

    try:
        client = genai.Client(api_key=api_key)

        prompt = (
            "You are analyzing an image to extract facts for a LinkedIn post.\n\n"
            "Look at this image carefully and extract:\n"
            "1. What is shown (product, achievement, event, certificate, project, etc.)\n"
            "2. Key facts visible (numbers, metrics, names, dates)\n"
            "3. The main achievement or story this image represents\n"
            "4. Suggested LinkedIn post topic based on the image\n\n"
            "Respond ONLY with valid JSON:\n"
            '{"description": "...", "key_facts": ["fact1", "fact2"], '
            '"achievement": "...", "suggested_topic": "..."}'
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                max_output_tokens=512,
            ),
        )

        data = json.loads(response.text.strip())
        print(f"[vision_tool] Extracted: {data.get('suggested_topic', '')}")
        return data

    except Exception as e:
        print(f"[vision_tool] Vision analysis failed: {e}")
        return _empty_vision_result(str(e))


def _empty_vision_result(reason: str) -> Dict[str, Any]:
    return {
        "description": "",
        "key_facts": [],
        "achievement": "",
        "suggested_topic": "",
        "error": reason,
    }
