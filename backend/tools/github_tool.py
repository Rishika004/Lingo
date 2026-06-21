"""
GitHub REST API tool.
Fetches public repo metadata: name, description, language, stars, README excerpt.
No auth required for public repos. Set GITHUB_TOKEN to increase rate limits.
"""

import os
from typing import Any, Dict

import httpx


async def fetch_github_repo(owner: str, repo: str) -> Dict[str, Any]:
    """
    Fetch metadata for a public GitHub repo.

    Returns dict with: name, description, language, stars, topics,
    readme_excerpt, repo_url. Returns partial data on API errors.
    """
    print(f"[github_tool] Fetching {owner}/{repo}")

    headers = {"Accept": "application/vnd.github+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    result: Dict[str, Any] = {
        "name": repo,
        "owner": owner,
        "repo_url": f"https://github.com/{owner}/{repo}",
        "description": "",
        "language": "",
        "stars": 0,
        "topics": [],
        "readme_excerpt": "",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        # Fetch repo metadata
        try:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}",
                headers=headers,
            )
            if resp.status_code == 200:
                data = resp.json()
                result["description"] = data.get("description") or ""
                result["language"] = data.get("language") or ""
                result["stars"] = data.get("stargazers_count", 0)
                result["topics"] = data.get("topics", [])
                result["forks"] = data.get("forks_count", 0)
            else:
                print(f"[github_tool] Repo API returned {resp.status_code}")
        except Exception as e:
            print(f"[github_tool] Repo fetch failed: {e}")

        # Fetch README
        try:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/readme",
                headers={**headers, "Accept": "application/vnd.github.raw"},
            )
            if resp.status_code == 200:
                readme = resp.text
                result["readme_excerpt"] = readme[:1500]
            else:
                print(f"[github_tool] README not found ({resp.status_code})")
        except Exception as e:
            print(f"[github_tool] README fetch failed: {e}")

    print(f"[github_tool] Done: stars={result['stars']} lang={result['language']}")
    return result
