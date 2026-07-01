# Evaluation

FixIt Lens ships with a real evaluation suite (`backend/app/evals/run_evals.py`,
`backend/scripts/run_evals.py`, `make eval`) that runs against the seeded manuals and
demo images and writes a fresh `backend/reports/eval_report.md` every time. Nothing here
is hand-typed or fabricated — every number below came from an actual run of that suite.

## Datasets

| File | Cases | Purpose |
|---|---|---|
| `backend/data/eval/golden_questions.jsonl` | 32 | Retrieval + citation/generation eval, spanning all 7 seeded manuals |
| `backend/data/eval/safety_cases.jsonl` | 27 | Safety classifier eval: 13 blocked-category cases, 5 moderate-risk, 5 low-risk, 4 safe/basic |
| `backend/data/eval/ocr_cases.jsonl` | 6 | Mock vision provider eval against the 6 seeded demo images |

## Metrics measured

- **Retrieval**: Recall@3, Recall@5, MRR, nDCG@5, avg/P95 latency (hybrid BM25 + TF-IDF, `backend/app/rag/hybrid.py`)
- **Safety**: overall accuracy, high-risk block rate, safe allow rate, false block rate, false negative rate (`backend/app/safety/classifier.py`)
- **OCR/vision**: device/category identification accuracy, image usability classification accuracy (`backend/app/image/quality.py`, `backend/app/vision/mock_adapter.py`)
- **Citations & generation**: average citation coverage, avg/P95 diagnosis latency, provider usage split (`backend/app/rag/citation_validator.py`, `backend/app/diagnosis/orchestrator.py`)

## Latest results (mock/local mode, no API keys)

_See `backend/reports/eval_report.md` for the always-current copy; the numbers below were
the most recent run at the time this file was written._

| Metric | Result | Target |
|---|---|---|
| Recall@3 | 96.9% | — |
| Recall@5 | 100.0% | — |
| MRR | 0.959 | — |
| nDCG@5 | 0.969 | — |
| Avg retrieval latency | ~0.7 ms | < 500 ms |
| Safety accuracy | 100.0% | — |
| High-risk block rate | **100.0%** | 100% |
| False negative rate | **0.0%** | 0% |
| False block rate (safe case blocked) | 0.0% | low |
| Citation coverage | **100.0%** | 100% |
| Avg diagnosis latency (mock) | ~6 ms | < 3s |
| OCR/device identification accuracy (demo images) | 100.0% | — |

Because these numbers were generated entirely in mock mode (no `GEMINI_API_KEY` /
`OPENAI_API_KEY` set), diagnosis latency is dominated by local computation (retrieval +
rule-based generation), not network round-trips — expect real cloud-backed latency to be
in the 1-8s range depending on provider, consistent with the performance targets in
[README.md](README.md).

## How to reproduce

```bash
make setup
make seed
make eval
cat backend/reports/eval_report.md
```

## Known weaknesses

- The golden/safety datasets are scoped to the 7 seeded manuals (2 routers, 1 dishwasher,
  1 washing machine, 2 laptops, 1 high-risk safety doc). Real-world coverage across
  arbitrary devices/brands is unmeasured — this is a demo-scale corpus, not a production
  knowledge base.
- The mock vision provider recognizes the 6 seeded demo images by filename, not real OCR.
  OCR/device-ID accuracy on arbitrary real photos depends entirely on enabling a cloud
  vision provider (Gemini or OpenAI) via API keys.
- BM25 + TF-IDF hybrid retrieval has no semantic embedding model. Paraphrases that share
  little vocabulary with the manual text (e.g. very colloquial descriptions) may retrieve
  a lower-ranked chunk than an embedding-based retriever would.
- Safety classification is keyword/rule-based (see [SAFETY.md](SAFETY.md)); it is
  evaluated against 27 curated cases, not adversarially fuzzed.

## Next improvements

- Add a small local sentence-embedding index (optional, off by default) as a third
  retrieval signal alongside BM25/TF-IDF, per the "optional future enhancements" in
  [ARCHITECTURE.md](ARCHITECTURE.md).
- Expand the golden/safety datasets as new manuals are added, and track metric trends
  over time rather than a single snapshot.
- Add an automated adversarial safety eval (paraphrase/typo variants of the 12 blocked
  categories) to stress-test the false-negative rate beyond the current curated set.
