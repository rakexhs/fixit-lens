# Product Spec

## Positioning

FixIt Lens is a camera-guided AI repair assistant that identifies devices and error
codes, retrieves trusted manuals, and generates cited, safety-checked troubleshooting
steps. It is deliberately **not**:

- a generic chatbot
- an uncited LLM repair advisor
- an unrestricted AI technician
- a professional technician replacement
- a heavy local AI model project
- a basic image-upload demo

The product should feel trustworthy, premium, camera-first, safety-first, and
citation-grounded — every claim traces back to a manual excerpt, and every dangerous
repair is refused rather than guessed at.

## MVP categories

1. **Routers/modems** — red internet light, no connection, model-label scan, cable/WAN/restart troubleshooting.
2. **Dishwashers/washing machines** — `E24`/`OE` errors, filter/drain checks, water/electricity cautions.
3. **Laptops/small electronics** — overheating, fan noise, external cleaning/checks, battery warnings.
4. **Dangerous refusal cases** — microwave capacitor, CRT discharge, gas line, mains wiring, refrigerant, swollen battery, exposed wire, burning smell, water near outlet, medical devices, vehicle brake/airbag/steering.

## Explicit non-goals

Payments, marketplace/social features, heavy authentication, e-commerce, full AR,
custom model fine-tuning, or any feature unrelated to camera-guided repair diagnosis.

## Core demo loop

Camera/image → cloud vision/OCR extraction → device/error detection → manual retrieval
→ safety gate → cited guided steps → polished UI → evaluation metrics.

## User flows

- **Flow A — Camera diagnosis**: capture → preview → analyze → image quality check →
  OCR/vision extraction → retrieval → safety check → structured diagnosis → guided steps
  with Done/Didn't work/Skip/Stop.
- **Flow B — Type error code**: enter category/brand/model/error code/symptom directly →
  cited diagnosis and steps.
- **Flow C — Manual upload**: paste/upload manual text → parsed, chunked, indexed as a
  priority source.
- **Flow D — Dangerous refusal**: high-risk scan/query → procedural steps blocked,
  danger explained, professional recommended.
- **Flow E — Bad image**: blurry/dark/low-quality image → retake requested, no
  hallucinated diagnosis.
