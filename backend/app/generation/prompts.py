SYSTEM_PROMPT = (
    "You are FixIt Lens, a helpful visual assistant. Identify whatever is in the photo — "
    "appliances, electronics, furniture, vehicles, tools, or everyday objects. "
    "If it is a repairable device, extract brand/model/error codes. "
    "If it is NOT a device or appliance, still describe what you see, whether it appears "
    "damaged, and whether any action is needed. Only provide hands-on repair steps when "
    "supported by provided source chunks. Every procedural step must include citation_ids. "
    "If safety risk is high, refuse procedural repair instructions and recommend a qualified "
    "technician. Do not invent technical specs not visible in the image or sources. "
    "Return valid JSON matching the schema."
)

ANSWER_JSON_SCHEMA = {
    "device_summary": {"category": "string", "brand": "string|null", "model": "string|null", "confidence": "number"},
    "diagnosis": {"likely_issue": "string", "confidence": "number", "reasoning_summary": "string"},
    "safety": {
        "risk_level": "integer 0-3",
        "label": "string",
        "warnings": ["string"],
        "blocked": "boolean",
        "professional_required": "boolean",
    },
    "steps": [
        {
            "step_number": "integer",
            "title": "string",
            "instruction": "string",
            "why": "string",
            "tools": ["string"],
            "citation_ids": ["string"],
            "stop_if": ["string"],
        }
    ],
    "clarifying_question": "string|null",
    "sources": [{"id": "string", "title": "string", "section": "string", "page": "string|null"}],
}


def build_user_prompt(
    device_category: str,
    brand: str | None,
    model: str | None,
    error_code: str | None,
    symptom: str | None,
    user_text: str | None,
    safety_risk_level: int,
    safety_blocked: bool,
    retrieved_chunks: list[dict],
) -> str:
    sources_block = "\n\n".join(
        f"[{c['id']}] {c.get('title', '')} - {c.get('section', '')}\n{c.get('text', '')}" for c in retrieved_chunks
    )

    return (
        f"Device category: {device_category}\n"
        f"Brand: {brand or 'unknown'}\n"
        f"Model: {model or 'unknown'}\n"
        f"Error code: {error_code or 'none'}\n"
        f"Symptom: {symptom or 'none'}\n"
        f"User description: {user_text or 'none'}\n"
        f"Safety risk level (pre-computed, 0-3): {safety_risk_level}\n"
        f"Safety blocked (pre-computed): {safety_blocked}\n\n"
        f"Retrieved source chunks (use citation_ids matching the bracketed IDs below; "
        f"do not cite any ID not listed here):\n{sources_block}\n\n"
        f"Respond with ONLY a JSON object matching this schema:\n{ANSWER_JSON_SCHEMA}"
    )
