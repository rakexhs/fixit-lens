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


def get_active_provider() -> VisionProvider:
    settings = get_settings()
    for name in settings.provider_order:
        provider_cls = _PROVIDER_REGISTRY.get(name)
        if provider_cls is None:
            continue
        provider = provider_cls()
        if provider.is_configured():
            return provider
    return MockVisionAdapter()


def extract_from_image(request: VisionRequest) -> VisionExtraction:
    provider = get_active_provider()
    try:
        return provider.extract(request)
    except Exception:
        if provider.name == "mock":
            raise
        logger.exception("Vision provider %s failed, falling back to mock", provider.name)
        return MockVisionAdapter().extract(request)
