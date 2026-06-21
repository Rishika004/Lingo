"""
LinkedIn publishing tool.
Uses linkedin-api (unofficial, credentials-based) to post text updates.
"""

import os
from typing import Any, Dict


async def post_to_linkedin(text: str, email: str, password: str) -> Dict[str, Any]:
    """
    Post text to LinkedIn as the authenticated user.

    Args:
        text: The post content.
        email: LinkedIn account email.
        password: LinkedIn account password.

    Returns:
        dict with status: "posted" | "failed", and optional error/post_id.
    """
    print(f"[linkedin_tool] Posting to LinkedIn ({len(text)} chars)")

    try:
        from linkedin_api import Linkedin
        api = Linkedin(email, password)

        # linkedin-api v2: create_share posts a text update
        response = api.create_share(text)

        print(f"[linkedin_tool] Posted successfully")
        return {"status": "posted", "post_id": response.get("id", "") if isinstance(response, dict) else ""}

    except Exception as e:
        print(f"[linkedin_tool] Post failed: {e}")
        return {"status": "failed", "error": str(e)}
