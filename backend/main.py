"""
FastAPI entry point for PostCraft backend.
Exposes /health, /generate, and /publish endpoints.
"""

import time
from typing import Any, Dict, List
from dotenv import load_dotenv
import pathlib

load_dotenv(pathlib.Path(__file__).parent.parent / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.agents.orchestrator import AgentState, get_graph
from backend.memory.supabase_rag import log_event, store_draft
from backend.tools.linkedin_tool import post_to_linkedin

app = FastAPI(title="PostCraft API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    input_type: str  # "github" | "image" | "text"
    input_value: str  # URL, base64 image, or raw text
    audience: str  # "founder" | "engineer" | "jobseeker" | "recruiter"
    tone: str  # "professional" | "casual" | "storytelling" | "bold"
    voice_samples: List[str] = []  # optional, max 2 past posts


class PublishRequest(BaseModel):
    text: str
    linkedin_email: str
    linkedin_password: str


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/generate")
async def generate(request: GenerateRequest) -> Dict[str, Any]:
    start_time = time.time()

    state = AgentState(
        input_type=request.input_type,
        input_value=request.input_value,
        audience=request.audience,
        tone=request.tone,
        voice_samples=request.voice_samples,
    )

    try:
        graph = get_graph()
        result = await graph.ainvoke(state.model_dump())
    except Exception as e:
        import traceback
        print("=== GENERATE ERROR ===")
        traceback.print_exc()
        print("=== END ERROR ===")
        try:
            log_event("error", request.input_type, request.audience, 0, error=str(e))
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))

    generation_time_ms = int((time.time() - start_time) * 1000)

    try:
        store_draft(
            request.input_type,
            request.audience,
            request.tone,
            result.get("variants", []),
            result.get("best_index", 0),
            generation_time_ms,
        )
    except Exception:
        pass

    try:
        log_event("generate", request.input_type, request.audience, generation_time_ms, error=None)
    except Exception:
        pass

    return {
        "variants": result.get("variants", []),
        "best_index": result.get("best_index", 0),
        "generation_time_ms": generation_time_ms,
    }


@app.post("/publish")
async def publish(request: PublishRequest) -> Dict[str, Any]:
    try:
        result = await post_to_linkedin(request.text, request.linkedin_email, request.linkedin_password)
        return result
    except Exception as e:
        return {"status": "failed", "error": str(e)}
