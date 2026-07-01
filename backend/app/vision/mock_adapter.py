from app.diagnosis.device_identifier import identify_brand, identify_category, identify_model
from app.diagnosis.problem_classifier import classify_problem
from app.image.demo_image_detector import detect_demo_scenario
from app.vision.base import VisionExtraction, VisionProvider, VisionRequest


class MockVisionAdapter(VisionProvider):
    """Deterministic, offline vision provider.

    Recognizes the seeded FixIt Lens demo images by filename, and otherwise
    falls back to lightweight keyword-based extraction over the user's hint
    text so the app still behaves sensibly with arbitrary photos and no keys.
    """

    name = "mock"

    def is_configured(self) -> bool:
        return True

    def extract(self, request: VisionRequest) -> VisionExtraction:
        scenario = detect_demo_scenario(request.filename)
        if scenario is not None:
            return VisionExtraction(
                ocr_text=scenario.ocr_text,
                ocr_tokens=scenario.ocr_text.split(),
                ocr_confidence=0.95 if scenario.ocr_text else 0.0,
                device_category=scenario.category,
                brand=scenario.brand,
                model=scenario.model,
                device_confidence=scenario.device_confidence,
                problem_type=scenario.problem_type,
                error_code=scenario.error_code,
                symptom=scenario.symptom,
                problem_confidence=scenario.problem_confidence,
                provider_used=self.name,
                raw_notes="matched deterministic demo scenario by filename",
            )

        hint = request.user_hint or ""
        category, cat_conf = identify_category(hint)
        brand, brand_conf = identify_brand(hint)
        model, model_conf = identify_model(hint)
        problem = classify_problem(hint, category)

        device_confidence = round(max(cat_conf, brand_conf) if hint else 0.0, 2)
        clarifying_question = None
        if device_confidence < 0.5:
            clarifying_question = (
                "I couldn't confidently identify the device or error from the image. "
                "Could you tell me the device type, brand/model, or any error code/text you see?"
            )

        return VisionExtraction(
            ocr_text=hint,
            ocr_tokens=hint.split(),
            ocr_confidence=0.4 if hint else 0.0,
            device_category=category,
            brand=brand,
            model=model,
            device_confidence=device_confidence,
            problem_type=problem.problem_type,
            error_code=problem.error_code,
            symptom=problem.symptom,
            problem_confidence=problem.confidence,
            provider_used=self.name,
            raw_notes="no demo scenario matched; used hint-based fallback extraction",
            clarifying_question=clarifying_question,
        )
