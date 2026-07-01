import base64
import json
import re

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.vision.base import VisionExtraction, VisionProvider, VisionRequest

GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

PROMPT_TEMPLATE = (
    "You are a device/error identification assistant. Given a photo of a device label, "
    "error display, warning light, or broken part, extract visible text and identify the "
    "device and problem. Return ONLY a valid JSON object (no markdown fences) with keys: "
    "ocr_text (string), device_category (one of router, dishwasher, washing_machine, laptop, "
    "dangerous, unknown), brand (string or null), model (string or null), "
    "device_confidence (0-1 float), problem_type (string), error_code (string or null), "
    "symptom (string), problem_confidence (0-1 float).{hint_suffix}"
)

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


class GeminiVisionAdapter(VisionProvider):
    name = "gemini"

    def __init__(self) -> None:
        self.settings = get_settings()

    def is_configured(self) -> bool:
        return bool(self.settings.gemini_api_key)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, max=4))
    def _call_api(self, image_b64: str, user_hint: str | None) -> dict:
        hint_suffix = f" Additional user context: {user_hint}" if user_hint else ""
        prompt = PROMPT_TEMPLATE.format(hint_suffix=hint_suffix)

        url = GEMINI_URL_TEMPLATE.format(model=self.settings.gemini_vision_model)
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": "image/jpeg", "data": image_b64}},
                    ]
                }
            ],
            "generationConfig": {"temperature": 0.1},
        }
        with httpx.Client(timeout=20.0) as client:
            response = client.post(url, params={"key": self.settings.gemini_api_key}, json=payload)
            response.raise_for_status()
            data = response.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        fence_match = _JSON_FENCE_RE.search(text)
        json_text = fence_match.group(1) if fence_match else text
        return json.loads(json_text)

    def extract(self, request: VisionRequest) -> VisionExtraction:
        image_b64 = base64.b64encode(request.image_bytes).decode("utf-8")
        parsed = self._call_api(image_b64, request.user_hint)

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
