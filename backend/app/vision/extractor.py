import logging

from app.config import get_settings
from app.vision.base import VisionExtraction, VisionProvider, VisionRequest
from app.vision.gemini_adapter import GeminiVisionAdapter
from app.vision.mock_adapter import MockVisionAdapter
from app.vision.openai_adapter import OpenAIVisionAdapter

logger = logging.getLogger(__name__)

_PROVIDER_REGISTRY: dict[str, type[VisionProvider]] = {
    "gemini": GeminiVisionAdapter,
    "openai": OpenAIVisionAdapter,
    "mock": MockVisionAdapter,
}


def extract_from_image(request: VisionRequest) -> VisionExtraction:
    settings = get_settings()
    errors: list[str] = []

    for name in settings.provider_order:
        provider_cls = _PROVIDER_REGISTRY.get(name)
        if provider_cls is None:
            continue
        provider = provider_cls()
        if not provider.is_configured():
            continue
        try:
            return provider.extract(request)
        except Exception as exc:
            errors.append(f"{name}: {exc}")
            logger.exception("Vision provider %s failed, trying next provider", name)

    if errors:
        logger.warning("All vision providers failed (%s); using mock fallback", "; ".join(errors))
    return MockVisionAdapter().extract(request)
