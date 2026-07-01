from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class VisionExtraction:
    ocr_text: str
    ocr_tokens: list[str]
    ocr_confidence: float
    device_category: str
    brand: str | None
    model: str | None
    device_confidence: float
    problem_type: str
    error_code: str | None
    symptom: str
    problem_confidence: float
    provider_used: str
    raw_notes: str = ""
    clarifying_question: str | None = None


@dataclass
class VisionRequest:
    image_bytes: bytes
    filename: str | None = None
    user_hint: str | None = None


class VisionProvider(ABC):
    name: str = "base"

    @abstractmethod
    def extract(self, request: VisionRequest) -> VisionExtraction: ...

    @abstractmethod
    def is_configured(self) -> bool: ...
