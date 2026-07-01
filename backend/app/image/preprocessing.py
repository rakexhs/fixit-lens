from io import BytesIO

from PIL import Image

MAX_DIMENSION = 1600


def normalize_image(image_bytes: bytes) -> bytes:
    """Downscale oversized images and re-encode as JPEG for consistent downstream processing."""
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    if max(image.width, image.height) > MAX_DIMENSION:
        ratio = MAX_DIMENSION / max(image.width, image.height)
        new_size = (int(image.width * ratio), int(image.height * ratio))
        image = image.resize(new_size)

    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=90)
    return buffer.getvalue()
