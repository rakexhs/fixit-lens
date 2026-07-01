import base64

from app.config import get_settings
from app.providers.gemini_interactions import create_interaction, parse_json_output
from app.vision.base import VisionExtraction, VisionProvider, VisionRequest

PROMPT_TEMPLATE = (
    "You are a visual identification assistant. Identify whatever is in the photo — appliances, "
    "electronics, furniture, vehicles, tools, food, plants, or everyday objects. "
    "Extract visible text and describe any damage or issue.{hint_suffix}"
)

VISION_JSON_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "ocr_text": {"type": "string"},
        "device_category": {
            "type": "string",
            "description": "router, dishwasher, washing_machine, laptop, appliance, electronics, vehicle, furniture, general, dangerous, or unknown",
        },
        "brand": {"type": "string"},
        "model": {"type": "string"},
        "device_confidence": {"type": "number"},
        "problem_type": {"type": "string"},
        "error_code": {"type": "string"},
        "symptom": {"type": "string"},
        "problem_confidence": {"type": "number"},
    },
    "required": [
        "ocr_text",
        "device_category",
        "device_confidence",
        "problem_type",
        "symptom",
        "problem_confidence",
    ],
}


class GeminiVisionAdapter(VisionProvider):
    name = "gemini"

    def __init__(self) -> None:
        self.settings = get_settings()

    def is_configured(self) -> bool:
        return bool(self.settings.gemini_api_key)

    def extract(self, request: VisionRequest) -> VisionExtraction:
        hint_suffix = f" Additional user context: {request.user_hint}" if request.user_hint else ""
        prompt = PROMPT_TEMPLATE.format(hint_suffix=hint_suffix)
        image_b64 = base64.b64encode(request.image_bytes).decode("utf-8")

        data = create_interaction(
            self.settings.gemini_api_key,
            self.settings.gemini_vision_model,
            [
                {"type": "text", "text": prompt},
                {"type": "image", "data": image_b64, "mime_type": "image/jpeg"},
            ],
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": VISION_JSON_SCHEMA,
            },
        )
        parsed = parse_json_output(data)

        ocr_text = parsed.get("ocr_text", "") or ""
        return VisionExtraction(
            ocr_text=ocr_text,
            ocr_tokens=ocr_text.split(),
            ocr_confidence=float(parsed.get("device_confidence", 0.5)),
            device_category=parsed.get("device_category", "unknown"),
            brand=parsed.get("brand"),
            model=parsed.get("model"),
            device_confidence=float(parsed.get("device_confidence", 0.0)),
            problem_type=parsed.get("problem_type", "unknown"),
            error_code=parsed.get("error_code"),
            symptom=parsed.get("symptom", ""),
            problem_confidence=float(parsed.get("problem_confidence", 0.0)),
            provider_used=self.name,
        )
