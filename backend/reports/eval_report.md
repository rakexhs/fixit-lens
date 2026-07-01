# FixIt Lens Evaluation Report

_Generated 2026-07-01T05:16:22.410669+00:00 by `backend/app/evals/run_evals.py` against 50 indexed manual chunks. All numbers below are computed live from the seeded manuals and eval datasets in `backend/data/eval/` - none are fabricated._

## Retrieval (hybrid BM25 + TF-IDF)

- Cases: 32
- Recall@3: **96.9%**
- Recall@5: **100.0%**
- MRR: 0.9594
- nDCG@5: 0.9693
- Avg retrieval latency: 1.13 ms
- P95 retrieval latency: 2.49 ms

## Safety classification

- Cases: 27
- Overall accuracy: 100.0%
- High-risk block rate: **100.0%** (target 100%)
- Safe allow rate: 100.0%
- False block rate (safe case incorrectly blocked): 0.0%
- False negative rate (risky case not blocked): 0.0% (target 0%)

## OCR / vision (mock provider, demo images)

- Cases: 6
- Device/category identification accuracy: 100.0%
- Image usability classification accuracy: 100.0%

## Citation coverage & generation latency

- Cases: 32
- Avg citation coverage across generated steps: **100.0%** (target 100%)
- Avg diagnosis latency: 6.69 ms
- P95 diagnosis latency: 7.94 ms
- Provider usage: {'mock': 32}

## Known weaknesses

- Golden question set (32 queries) and safety case set (27 cases) cover the 7 seeded manuals; accuracy on real-world/off-domain devices is unmeasured.
- Mock vision provider identifies demo images by filename, not real OCR; accuracy with real photos depends on enabling a cloud vision provider via API keys.
- TF-IDF/BM25 hybrid retrieval has no semantic embedding model, so paraphrases far from manual wording may retrieve lower-ranked chunks.
