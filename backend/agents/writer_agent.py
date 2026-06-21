"""
Writer Agent Node.
Uses Gemini 2.5 Flash to generate 3 LinkedIn post variants.
Injects RAG style examples and user voice samples into the prompt.
"""

import json
import os
from typing import Any, Dict, List

from google import genai
from google.genai import types

from postcraft.backend.agents.orchestrator import AgentState


def _build_writer_prompt(state: AgentState) -> str:
    style_section = ""
    if state.style_examples:
        examples = "\n\n".join(
            f"Example {i+1}:\n{ex['text']}"
            for i, ex in enumerate(state.style_examples[:5])
        )
        style_section = f"\n\n## High-performing LinkedIn posts in this style:\n{examples}"

    voice_section = ""
    if state.voice_samples:
        samples = "\n\n".join(
            f"Sample {i+1}:\n{s}"
            for i, s in enumerate(state.voice_samples[:2])
        )
        voice_section = (
            f"\n\n## User's own writing style (mimic this voice exactly):\n{samples}"
        )

    audience_context = {
        "founder": "entrepreneurs, startup founders, and business builders",
        "engineer": "software engineers, developers, and technical builders",
        "jobseeker": "professionals actively seeking new roles and career opportunities",
        "recruiter": "hiring managers, talent leaders, and HR professionals",
    }.get(state.audience, state.audience)

    tone_guidance = {
        "professional": "authoritative, data-driven, polished. Use formal language.",
        "casual": "conversational, friendly, relatable. Write like you're talking to a friend.",
        "storytelling": "narrative arc with a hook, middle, and lesson. Personal and emotional.",
        "bold": "short punchy sentences. Contrarian takes. Strong opinions. Make people stop scrolling.",
    }.get(state.tone, state.tone)

    return f"""You are a world-class LinkedIn ghostwriter.

## Task
Write 3 distinct LinkedIn posts based on this content:

{state.enriched_facts.get('summary', state.input_value)}

## Audience
{state.audience} — writing FOR {audience_context}

## Tone
{state.tone} — {tone_guidance}

## LinkedIn Post Rules
- Start with a hook that stops scrolling (first line is everything)
- Use line breaks generously — no big walls of text
- Include 1 strong CTA at the end (comment, DM, follow, share)
- NO hashtags unless they add real value
- Length: 150-300 words per variant
- Each variant must have a completely different hook and angle
{style_section}{voice_section}

## Output Format
Respond ONLY with a JSON array of exactly 3 objects:
[
  {{"text": "full post text variant 1"}},
  {{"text": "full post text variant 2"}},
  {{"text": "full post text variant 3"}}
]"""


async def writer_node(state: AgentState) -> AgentState:
    print(f"\n[writer] Generating 3 variants | audience={state.audience} tone={state.tone}")

    try:
        api_key = os.getenv("GEMINI_API_KEY", "")
        client = genai.Client(api_key=api_key)
        prompt = _build_writer_prompt(state)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                max_output_tokens=4096,
                system_instruction=(
                    "You are a LinkedIn ghostwriter. Output ONLY valid JSON arrays. "
                    "No markdown, no preamble, no explanation."
                ),
            ),
        )

        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rstrip("`").strip()

        variants = json.loads(raw)
        if not isinstance(variants, list) or len(variants) != 3:
            raise ValueError(f"Expected list of 3, got: {type(variants)}")

        state.variants = variants
        print(f"[writer] Generated {len(variants)} variants")

    except Exception as e:
        state.errors.append(f"writer_node: {str(e)}")
        print(f"[writer] Generation failed: {e}")

    return state
