from dataclasses import dataclass
from io import BytesIO

import cv2
import numpy as np
from PIL import Image

BLUR_VARIANCE_THRESHOLD = 60.0
MIN_DIMENSION = 200
DARK_MEAN_THRESHOLD = 35.0
BRIGHT_MEAN_THRESHOLD = 235.0


@dataclass
class QualityResult:
    usable: bool
    score: float
    issues: list[str]
    width: int
    height: int


def _to_cv_gray(image_bytes: bytes) -> np.ndarray:
    pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")
    arr = np.array(pil_image)
    return cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY), pil_image.width, pil_image.height


def assess_image_quality(image_bytes: bytes) -> QualityResult:
    gray, width, height = _to_cv_gray(image_bytes)

    blur_variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(gray.mean())

    issues: list[str] = []
    if blur_variance < BLUR_VARIANCE_THRESHOLD:
        issues.append("Image looks blurry. Hold the camera steady and refocus, then retake.")
    if brightness < DARK_MEAN_THRESHOLD:
        issues.append("Image is too dark. Add more light and retake.")
    if brightness > BRIGHT_MEAN_THRESHOLD:
        issues.append("Image is overexposed/too bright. Reduce glare and retake.")
    if min(width, height) < MIN_DIMENSION:
        issues.append("Image resolution is too low. Move closer or use a higher-resolution photo.")

    blur_score = min(blur_variance / (BLUR_VARIANCE_THRESHOLD * 3), 1.0)
    brightness_score = 1.0 - min(abs(brightness - 128.0) / 128.0, 1.0)
    size_score = 1.0 if min(width, height) >= MIN_DIMENSION else min(width, height) / MIN_DIMENSION

    score = round(0.5 * blur_score + 0.3 * brightness_score + 0.2 * size_score, 4)
    usable = len(issues) == 0

    return QualityResult(usable=usable, score=score, issues=issues, width=width, height=height)
