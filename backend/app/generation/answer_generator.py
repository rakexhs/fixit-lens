import json
import logging
import re
from dataclasses import dataclass, field

import httpx
from tenacity import RetryError, retry, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.generation.prompts import SYSTEM_PROMPT, build_user_prompt
from app.rag.hybrid import RetrievedChunk
from app.safety.policy import SafetyDecision

logger = logging.getLogger(__name__)

TOOL_KEYWORDS = ["screwdriver", "compressed air", "towel", "pan", "cloth", "insulated tools"]
STOP_SENTENCE_RE = re.compile(r"[^.]*\b(stop|contact a|do not|call a)\b[^.]*\.", re.IGNORECASE)


@dataclass
class GenerationContext:
    device_category: str
    brand: str | None
    model: str | None
    error_code: str | None
    symptom: str | None
    user_text: str | None
    device_confidence: float
    problem_confidence: float
    safety: SafetyDecision
    retrieved_chunks: list[RetrievedChunk] = field(default_factory=list)


def _extract_tools(text: str) -> list[str]:
    blob = text.lower()
    return [kw for kw in TOOL_KEYWORDS if kw in blob]


def _extract_stop_if(text: str) -> list[str]:
    return [m.group(0).strip() for m in STOP_SENTENCE_RE.finditer(text)][:2]


def _trim_instruction(text: str, max_len: int = 320) -> str:
    text = text.strip()
    if len(text) <= max_len:
        return text
    truncated = text[:max_len]
    last_period = truncated.rfind(".")
    return truncated[: last_period + 1] if last_period > 40 else truncated + "..."


def deterministic_generate(context: GenerationContext) -> dict:
    device_summary = {
        "category": context.device_category,
        "brand": context.brand,
        "model": context.model,
        "confidence": round(context.device_confidence, 2),
    }
    safety_dict = {
        "risk_level": context.safety.risk_level,
        "label": context.safety.label,
        "warnings": context.safety.warnings,
        "blocked": context.safety.blocked,
        "professional_required": context.safety.professional_required,
    }

    if context.safety.blocked:
        issue_desc = context.symptom or context.safety.label
        return {
            "device_summary": device_summary,
            "diagnosis": {
                "likely_issue": f"Possible {issue_desc}".strip(),
                "confidence": round(max(context.device_confidence, context.problem_confidence), 2),
                "reasoning_summary": (
                    "This matches a high-risk repair category. No procedural steps are provided; "
                    "a qualified professional should handle this safely."
                ),
            },
            "safety": safety_dict,
            "steps": [],
            "clarifying_question": None,
            "sources": [_chunk_to_source(rc) for rc in context.retrieved_chunks[:3]],
        }

    if context.device_category == "unknown" and not context.retrieved_chunks:
        visible = (context.symptom or context.user_text or "the item in your photo").strip()
        return {
            "device_summary": device_summary,
            "diagnosis": {
                "likely_issue": f"What we see: {visible}".strip(),
                "confidence": round(max(context.device_confidence, context.problem_confidence, 0.35), 2),
                "reasoning_summary": (
                    "We could not match a specific repair manual, but here is a general assessment. "
                    "If this is an appliance or electronics issue, try a clearer photo of the label or error screen."
                ),
            },
            "safety": safety_dict,
            "steps": [
                {
                    "step_number": 1,
                    "title": "Describe what you see",
                    "instruction": (
                        "Note any visible damage, error messages, unusual sounds, leaks, or warning lights. "
                        "Unplug the device if you smell burning or see sparks."
                    ),
                    "why": "A clear symptom list helps narrow down safe next steps.",
                    "tools": [],
                    "citation_ids": [],
                    "stop_if": ["Stop if you see smoke, sparks, gas smell, or flooding."],
                },
                {
                    "step_number": 2,
                    "title": "Check the basics",
                    "instruction": (
                        "Confirm power/network connections, vents are clear, filters are clean, and settings "
                        "were not changed recently. Retake a photo of any label or error code for a more specific answer."
                    ),
                    "why": "Many issues are external and safe to check without opening the device.",
                    "tools": [],
                    "citation_ids": [],
                    "stop_if": [],
                },
            ],
            "clarifying_question": "What type of item is this, and what problem are you noticing?",
            "sources": [],
        }

    steps = []
    for idx, rc in enumerate(context.retrieved_chunks[:4], start=1):
        chunk = rc.chunk
        steps.append(
            {
                "step_number": idx,
                "title": chunk.get("section", f"Step {idx}"),
                "instruction": _trim_instruction(chunk.get("text", "")),
                "why": f"Based on {chunk.get('title', 'the retrieved manual')} guidance for this issue.",
                "tools": _extract_tools(chunk.get("text", "")),
                "citation_ids": [chunk["id"]],
                "stop_if": _extract_stop_if(chunk.get("text", "")),
            }
        )

    problem_label = (context.symptom or context.error_code or "the reported issue").strip()
    likely_issue = f"{problem_label}".strip().capitalize() or "Issue requires further diagnosis"
    reasoning_parts = [f"Matched {len(context.retrieved_chunks)} relevant manual section(s)"]
    if context.error_code:
        reasoning_parts.append(f"for error code {context.error_code}")
    if context.brand:
        reasoning_parts.append(f"on {context.brand} {context.model or ''}".strip())

    return {
        "device_summary": device_summary,
        "diagnosis": {
            "likely_issue": likely_issue,
            "confidence": round((context.device_confidence + context.problem_confidence) / 2, 2),
            "reasoning_summary": " ".join(reasoning_parts) + ".",
        },
        "safety": safety_dict,
        "steps": steps,
        "clarifying_question": (
            None
            if context.device_confidence >= 0.5 or context.retrieved_chunks
            else "Could you confirm the exact brand, model, or error code shown on the device?"
        ),
        "sources": [_chunk_to_source(rc) for rc in context.retrieved_chunks],
    }


def _chunk_to_source(rc: RetrievedChunk) -> dict:
    chunk = rc.chunk
    return {
        "id": chunk["id"],
        "title": chunk.get("title", ""),
        "section": chunk.get("section", ""),
        "page": chunk.get("page"),
        "snippet": (chunk.get("text", "")[:220] + "...") if len(chunk.get("text", "")) > 220 else chunk.get("text", ""),
        "score": rc.score,
        "why_matched": rc.why_matched,
    }


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=0.5, max=3))
def _call_openai_text(prompt: str, settings) -> dict:
    headers = {"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"}
    payload = {
        "model": settings.openai_text_model,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},
        "temperature": 0.1,
    }
    with httpx.Client(timeout=20.0) as client:
        response = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
    return json.loads(data["choices"][0]["message"]["content"])


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=0.5, max=6))
def _call_gemini_text(prompt: str, settings) -> dict:
    from app.providers.gemini_interactions import create_interaction, parse_json_output

    data = create_interaction(
        settings.gemini_api_key,
        settings.gemini_text_model,
        f"{SYSTEM_PROMPT}\n\n{prompt}",
        response_format={
            "type": "text",
            "mime_type": "application/json",
        },
    )
    return parse_json_output(data)


def generate_answer(context: GenerationContext) -> tuple[dict, str]:
    settings = get_settings()
    retrieved_dicts = [rc.chunk for rc in context.retrieved_chunks]
    prompt = build_user_prompt(
        device_category=context.device_category,
        brand=context.brand,
        model=context.model,
        error_code=context.error_code,
        symptom=context.symptom,
        user_text=context.user_text,
        safety_risk_level=context.safety.risk_level,
        safety_blocked=context.safety.blocked,
        retrieved_chunks=retrieved_dicts,
    )

    for provider_name in settings.provider_order:
        try:
            if provider_name == "openai" and settings.openai_api_key:
                data = _call_openai_text(prompt, settings)
                return data, "openai"
            if provider_name == "gemini" and settings.gemini_api_key:
                data = _call_gemini_text(prompt, settings)
                return data, "gemini"
        except (RetryError, Exception):
            logger.exception("Cloud provider %s generation failed, trying next provider", provider_name)
            continue

    return deterministic_generate(context), "mock"
