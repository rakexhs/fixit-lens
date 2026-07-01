# API Contract

Base URL: `http://127.0.0.1:8000` (configurable via `EXPO_PUBLIC_API_BASE_URL` / Settings screen).
All responses are JSON. All Pydantic models live in `backend/app/schemas.py`.

## `GET /health`

```json
{ "status": "ok", "version": "0.1.0" }
```

## `POST /api/analyze/image`

`multipart/form-data`: `image` (file, required), `user_hint` (string, optional), `mode` (string, optional).

```json
{
  "session_id": "f0fa43ca...",
  "image_quality": { "usable": true, "score": 0.79, "issues": [] },
  "ocr": { "text": "TP-Link Archer AX55 ...", "tokens": ["TP-Link", "..."], "confidence": 0.95 },
  "detected_device": { "category": "router", "brand": "TP-Link", "model": "Archer AX55", "confidence": 0.94 },
  "detected_problem": { "type": "no_internet_connection", "error_code": null, "symptom": "red internet light, no internet connection", "confidence": 0.9 },
  "provider_used": "mock"
}
```

## `POST /api/diagnose`

```json
{
  "session_id": "optional-existing-session-id",
  "user_text": "optional free text",
  "device_category": "router",
  "brand": "TP-Link",
  "model": "AX55",
  "error_code": null,
  "symptom": "red internet light"
}
```

Response:

```json
{
  "session_id": "...",
  "diagnosis": { "likely_issue": "...", "confidence": 0.88, "reasoning_summary": "..." },
  "safety": { "risk_level": 0, "label": "Safe - basic external troubleshooting", "warnings": [], "blocked": false, "professional_required": false },
  "steps": [
    { "step_number": 1, "title": "...", "instruction": "...", "why": "...", "tools": [], "citation_ids": ["router_tp_link_archer_ax55#..."], "stop_if": [] }
  ],
  "clarifying_question": null,
  "sources": [ { "id": "...", "title": "...", "section": "...", "page": null, "snippet": "...", "score": 1.65, "why_matched": "keyword match; brand match; ..." } ],
  "metrics": { "retrieval_latency_ms": 5.0, "generation_latency_ms": 2.1, "total_latency_ms": 21.8, "citation_coverage": 1.0, "provider_used": "mock" }
}
```

## `POST /api/manuals/upload`

`multipart/form-data`: `file` (.txt/.md, optional) or `text` (string, optional; one of the two is required), `title`, `category`, `brand`, `model` (all optional).

```json
{ "manual_id": "uploaded-test-manual-45daf7fa", "chunks_indexed": 3, "status": "indexed" }
```

## `GET /api/sessions`

Returns `SessionSummary[]` — id, created_at, device_category, brand, model, likely_issue, risk_level, blocked, provider_used.

## `GET /api/sessions/{session_id}`

Returns a `SessionDetail` — everything in `SessionSummary` plus `ocr_text`, `diagnosis`, `safety`, `steps`, `sources`, `feedback`.

## `POST /api/feedback`

```json
{ "session_id": "...", "step_number": 1, "result": "done", "comment": null }
```

`result` is one of `done | didnt_work | skip | stop`. Returns `{ "status": "recorded" }`.

## `GET /api/metrics`

```json
{
  "total_sessions": 83,
  "average_latency_ms": 5.18,
  "citation_coverage": 0.84,
  "safety_blocks": 11,
  "retrieval_count": 70,
  "provider_usage": { "mock": 80 }
}
```

## `POST /api/evals/run`

Runs the full evaluation suite (`backend/app/evals/run_evals.py`) synchronously and
returns the same summary dict written to `backend/reports/eval_report.md`.

## Error format

All error responses use FastAPI's standard shape: `{ "detail": "human-readable message" }`.
No stack traces are ever returned to the client (see the global exception handler in
`backend/app/main.py`).
