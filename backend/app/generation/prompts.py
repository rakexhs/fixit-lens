SYSTEM_PROMPT = (
    "You are FixIt Lens, a safety-first repair assistant. Only provide troubleshooting steps "
    "supported by provided source chunks. Every procedural step must include citation_ids. "
    "If device/model/problem is uncertain, ask one short clarification question. If safety risk "
    "is high, refuse procedural repair instructions and recommend a qualified technician. Prefer "
    "safe external troubleshooting before internal disassembly. Do not invent part names, voltage "
    "values, torque values, wiring instructions, hidden screws, or steps not present in sources. "
    "Do not provide instructions for microwave capacitor discharge, CRT discharge, gas appliance "
    "repair, refrigerant handling, mains wiring repair, swollen battery handling, medical-device "
    "repair, or vehicle brake/airbag/steering repair. Return valid JSON matching the schema."
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
