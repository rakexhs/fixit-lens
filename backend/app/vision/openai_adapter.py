import base64
import json

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.vision.base import VisionExtraction, VisionProvider, VisionRequest

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

SYSTEM_PROMPT = (
    "You are a visual identification assistant. Identify whatever is in the photo — appliances, "
    "electronics, furniture, vehicles, tools, food, plants, or everyday objects. "
    "Extract visible text (OCR). Return ONLY valid JSON with keys: ocr_text (string), "
    "device_category (router, dishwasher, washing_machine, laptop, appliance, electronics, "
    "vehicle, furniture, general, dangerous, unknown), brand (string or null), "
    "model (string or null), device_confidence (0-1 float), problem_type (string), "
    "error_code (string or null), symptom (string describing what you see or what seems wrong), "
    "problem_confidence (0-1 float). Do not include any text outside the JSON object."
)


class OpenAIVisionAdapter(VisionProvider):
    name = "openai"

    def __init__(self) -> None:
        self.settings = get_settings()

    def is_configured(self) -> bool:
        return bool(self.settings.openai_api_key)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, max=4))
    def _call_api(self, image_b64: str, user_hint: str | None) -> dict:
        headers = {
            "Authorization": f"Bearer {self.settings.openai_api_key}",
            "Content-Type": "application/json",
        }
        user_text = "Identify the device/error in this image."
        if user_hint:
            user_text += f" Additional user context: {user_hint}"

        payload = {
            "model": self.settings.openai_vision_model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
                    ],
                },
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        }
        with httpx.Client(timeout=20.0) as client:
            response = client.post(OPENAI_CHAT_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)

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
