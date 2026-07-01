# Safety Model

FixIt Lens is built around one non-negotiable rule, enforced in code, not just in prompts:

> **No source citation + no safety classification = no repair instruction.**

Every procedural step returned by the API must (a) pass through the rule-based safety
classifier and (b) carry at least one `citation_id` pointing at a retrieved manual chunk
that actually exists. Steps that fail either check are dropped before the response ever
reaches the user — this is enforced in `backend/app/rag/citation_validator.py` and
`backend/app/diagnosis/orchestrator.py`, independent of whether a cloud LLM or the local
mock generator produced the answer.

## What FixIt Lens can help with

- Identifying a device, brand/model, and error code from a photo or typed description.
- Explaining what a known error code or symptom (e.g. red internet light, `E24`, `OE`)
  usually means, using cited manual excerpts.
- Walking through **safe, external** troubleshooting steps: power cycling, checking
  cables, cleaning accessible filters, checking drain hoses, external cleaning, etc.
- Flagging when a repair goes beyond what's safe to do without training, and pointing to
  a qualified professional.

## What it refuses to do

FixIt Lens never generates procedural, step-by-step instructions for:

- Microwave internal repair / capacitor discharge
- CRT discharge
- Gas appliance repair (gas lines, valves, leaks)
- Refrigerant handling
- Mains wiring repair (breaker panels, rewiring outlets)
- Swollen lithium battery handling
- Exposed wire repair
- Repeated breaker trips
- Burning smell / sparks
- Water near an outlet or live electricity
- Medical-device repair (CPAP, pacemakers, glucose monitors, etc.)
- Vehicle brake, airbag, or steering repair

These categories are defined in `backend/app/safety/safety_rules.yaml` under
`blocked_categories`, and matched by `backend/app/safety/classifier.py`. A match short-
circuits generation: `steps` is forced to an empty list regardless of what a cloud LLM
tried to produce (see `diagnosis/orchestrator.py`), and the response includes this
refusal message:

> "I can help identify what may be wrong, but I cannot provide step-by-step instructions
> for this repair because it may involve high-voltage, gas, fire, or injury risk. Please
> contact a qualified technician."

## Risk levels

| Level | Meaning | Example | Behavior |
|---|---|---|---|
| 0 | Safe / basic external check | Restart router, read an error code | Steps generated freely, cited |
| 1 | Low-risk external action | Clean an accessible filter, check a drain hose | Steps generated, cited |
| 2 | Moderate risk | Opening a laptop's back cover to replace a fan | Steps generated with warnings, tools, and stop conditions; still cited |
| 3 | High risk | Anything in the blocked categories above | **Blocked** — no steps, professional recommended |

## Citation requirement

Every non-blocked step must cite at least one chunk ID from the sources actually
retrieved for that request (`backend/app/rag/citation_validator.py`). Live evaluation
(`backend/reports/eval_report.md`) shows **100% citation coverage** across all 32 golden
queries and **100% high-risk block rate / 0% false negatives** across 27 safety cases —
see [EVALUATION.md](EVALUATION.md) for the full methodology.

## Limitations

- The safety classifier is rule/keyword-based, not a trained model. It is tuned against
  the scenarios in `backend/data/eval/safety_cases.jsonl`; novel phrasing for a dangerous
  situation could in principle slip past a keyword match. `SAFETY_STRICT_MODE=true` is
  the default and should stay on in any real deployment.
- FixIt Lens identifies *likely* issues from limited visual/textual evidence — it is not
  a certified diagnostic tool and does not replace inspection by a qualified technician.
- Retrieval is only as good as the seeded manuals; an uploaded manual becomes a priority
  source but is not itself safety-reviewed before indexing.

## User disclaimer

FixIt Lens is a repair *assistant*, not a professional technician. For anything the app
flags as high risk, or for any repair you are not confident performing safely, stop and
contact a licensed electrician, gas technician, HVAC technician, automotive mechanic, or
appliance repair professional as appropriate.

## Privacy notes

- Provider API keys (Gemini/OpenAI) live only in `backend/.env` and are never sent to,
  stored in, or bundled with the mobile app.
- Uploaded images are processed in memory for quality/vision analysis; the raw image
  bytes are not persisted to disk or logged. Only derived metadata (OCR text, detected
  device/problem, quality score) is stored in SQLite.
- The Settings screen exposes a "Delete local data" action that clears locally cached
  settings and the in-progress session on the mobile device.
