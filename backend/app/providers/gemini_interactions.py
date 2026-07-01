"""Gemini Interactions API client (https://ai.google.dev/gemini-api/docs/get-started)."""

from __future__ import annotations

import json
import re
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


def _headers(api_key: str) -> dict[str, str]:
    return {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json",
    }


def extract_output_text(data: dict[str, Any]) -> str:
    if isinstance(data.get("output_text"), str) and data["output_text"].strip():
        return data["output_text"].strip()

    chunks: list[str] = []
    for step in data.get("steps", []):
        if step.get("type") != "model_output":
            continue
        for block in step.get("content", []):
            if block.get("type") == "text" and block.get("text"):
                chunks.append(str(block["text"]))
    if chunks:
        return "\n".join(chunks).strip()

    raise ValueError("Gemini response contained no text output.")


def parse_json_output(data: dict[str, Any]) -> dict[str, Any]:
    raw = extract_output_text(data)
    fence = _JSON_FENCE_RE.search(raw)
    json_text = fence.group(1) if fence else raw
    json_text = re.sub(r"^```(?:json)?|```$", "", json_text.strip(), flags=re.MULTILINE).strip()
    parsed = json.loads(json_text)
    if not isinstance(parsed, dict):
        raise ValueError("Gemini JSON output was not an object.")
    return parsed


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, max=6))
def create_interaction(
    api_key: str,
    model: str,
    input_payload: str | list[dict[str, Any]],
    *,
    response_format: dict[str, Any] | None = None,
    timeout: float = 60.0,
) -> dict[str, Any]:
    body: dict[str, Any] = {"model": model, "input": input_payload}
    if response_format is not None:
        body["response_format"] = response_format

    with httpx.Client(timeout=timeout) as client:
        response = client.post(INTERACTIONS_URL, headers=_headers(api_key), json=body)
        response.raise_for_status()
        data = response.json()

    status = data.get("status")
    if status == "failed":
        raise RuntimeError(f"Gemini interaction failed: {data.get('error', data)}")
    if status not in (None, "completed", "requires_action"):
        raise RuntimeError(f"Gemini interaction incomplete: status={status}")

    return data
