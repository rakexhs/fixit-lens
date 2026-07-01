from dataclasses import dataclass, field

from sqlalchemy.orm import Session as DBSession

from app.db import repository
from app.diagnosis.device_identifier import identify_brand, identify_category, identify_model
from app.diagnosis.problem_classifier import classify_problem
from app.generation.answer_generator import GenerationContext, generate_answer
from app.image.preprocessing import normalize_image
from app.image.quality import assess_image_quality
from app.manuals.indexer import get_global_index
from app.manuals.retriever import build_query_text, retrieve_chunks
from app.metrics.latency import Timer
from app.rag.citation_validator import validate_steps
from app.safety.policy import evaluate_safety
from app.vision.base import VisionRequest
from app.vision.extractor import extract_from_image

RETRIEVAL_TOP_K = 5


@dataclass
class AnalyzeImageResult:
    session_id: str
    usable: bool
    quality_score: float
    issues: list[str]
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


def analyze_image(
    db: DBSession, image_bytes: bytes, filename: str | None, user_hint: str | None
) -> AnalyzeImageResult:
    quality = assess_image_quality(image_bytes)
    session = repository.create_session(db, device_category=None)

    repository.add_captured_image(
        db,
        session_id=session.id,
        filename=filename or "upload.jpg",
        quality_score=quality.score,
        usable=quality.usable,
        issues_json=quality.issues,
    )

    if not quality.usable:
        repository.add_ocr_result(
            db, session_id=session.id, text="", tokens_json=[], confidence=0.0, provider_used="none"
        )
        if quality.score < 0.08:
            return AnalyzeImageResult(
                session_id=session.id,
                usable=False,
                quality_score=quality.score,
                issues=quality.issues,
                ocr_text="",
                ocr_tokens=[],
                ocr_confidence=0.0,
                device_category="unknown",
                brand=None,
                model=None,
                device_confidence=0.0,
                problem_type="unknown",
                error_code=None,
                symptom="",
                problem_confidence=0.0,
                provider_used="none",
            )

    normalized = normalize_image(image_bytes)
    extraction = extract_from_image(VisionRequest(image_bytes=normalized, filename=filename, user_hint=user_hint))

    repository.add_ocr_result(
        db,
        session_id=session.id,
        text=extraction.ocr_text,
        tokens_json=extraction.ocr_tokens,
        confidence=extraction.ocr_confidence,
        provider_used=extraction.provider_used,
    )
    repository.update_session(
        db,
        session.id,
        device_category=extraction.device_category,
        brand=extraction.brand,
        model=extraction.model,
        error_code=extraction.error_code,
        symptom=extraction.symptom,
        device_confidence=extraction.device_confidence,
        provider_used=extraction.provider_used,
    )

    return AnalyzeImageResult(
        session_id=session.id,
        usable=True,
        quality_score=quality.score,
        issues=quality.issues,
        ocr_text=extraction.ocr_text,
        ocr_tokens=extraction.ocr_tokens,
        ocr_confidence=extraction.ocr_confidence,
        device_category=extraction.device_category,
        brand=extraction.brand,
        model=extraction.model,
        device_confidence=extraction.device_confidence,
        problem_type=extraction.problem_type,
        error_code=extraction.error_code,
        symptom=extraction.symptom,
        problem_confidence=extraction.problem_confidence,
        provider_used=extraction.provider_used,
    )


@dataclass
class DiagnoseResult:
    session_id: str
    diagnosis: dict
    safety: dict
    steps: list[dict]
    clarifying_question: str | None
    sources: list[dict]
    metrics: dict = field(default_factory=dict)


def diagnose(
    db: DBSession,
    session_id: str | None = None,
    user_text: str | None = None,
    device_category: str | None = None,
    brand: str | None = None,
    model: str | None = None,
    error_code: str | None = None,
    symptom: str | None = None,
) -> DiagnoseResult:
    total_timer = Timer()
    with total_timer.measure():
        session = repository.get_session(db, session_id) if session_id else None

        category = device_category or (session.device_category if session else None)
        brand_final = brand or (session.brand if session else None)
        model_final = model or (session.model if session else None)
        error_code_final = error_code or (session.error_code if session else None)
        symptom_final = symptom or (session.symptom if session else None)

        combined_text = " ".join(
            p for p in [user_text, category, brand_final, model_final, error_code_final, symptom_final] if p
        )

        cat_conf = 0.9
        if not category or category == "unknown":
            category, cat_conf = identify_category(combined_text)

        brand_conf = 0.9
        if not brand_final:
            brand_final, brand_conf = identify_brand(combined_text)
        if not model_final:
            model_final, _ = identify_model(combined_text)

        problem = classify_problem(combined_text, category, existing_error_code=error_code_final)
        error_code_final = problem.error_code or error_code_final
        symptom_final = symptom_final or problem.symptom

        device_confidence = round(max(cat_conf, brand_conf) if combined_text.strip() else 0.0, 2)
        problem_confidence = problem.confidence

        if session is None:
            session = repository.create_session(db, device_category=category)

        retrieval_timer = Timer()
        with retrieval_timer.measure():
            query_text = build_query_text(
                user_text, category, brand_final, model_final, error_code_final, symptom_final
            )
            index = get_global_index()
            prefer_safety = category == "dangerous"
            retrieved = retrieve_chunks(
                index,
                query_text,
                category=category if category and category != "unknown" else None,
                brand=brand_final,
                model=model_final,
                error_code=error_code_final,
                prefer_safety=prefer_safety,
                top_k=RETRIEVAL_TOP_K,
            )

        repository.add_retrieval_result(
            db,
            session_id=session.id,
            query=query_text,
            chunk_ids_json=[rc.chunk["id"] for rc in retrieved],
            scores_json={rc.chunk["id"]: rc.score for rc in retrieved},
            latency_ms=retrieval_timer.elapsed_ms,
        )

        safety_decision = evaluate_safety(combined_text)

        # Relevance ranking picks *which* chunks matter; re-order that same set into
        # natural document order so guided-repair steps read as a coherent sequence.
        ordered_for_generation = sorted(
            retrieved, key=lambda rc: (rc.chunk.get("manual_id", ""), rc.chunk.get("position", 0))
        )

        generation_timer = Timer()
        with generation_timer.measure():
            context = GenerationContext(
                device_category=category or "unknown",
                brand=brand_final,
                model=model_final,
                error_code=error_code_final,
                symptom=symptom_final,
                user_text=user_text,
                device_confidence=device_confidence,
                problem_confidence=problem_confidence,
                safety=safety_decision,
                retrieved_chunks=ordered_for_generation,
            )
            answer_json, provider_used = generate_answer(context)

        if safety_decision.blocked:
            answer_json["steps"] = []

        valid_chunk_ids = {rc.chunk["id"] for rc in retrieved}
        validation = validate_steps(answer_json.get("steps", []), valid_chunk_ids)
        answer_json["steps"] = validation.valid_steps

        repository.add_generated_answer(
            db,
            session_id=session.id,
            answer_json=answer_json,
            provider_used=provider_used,
            generation_latency_ms=generation_timer.elapsed_ms,
            citation_coverage=validation.citation_coverage,
        )

        repository.update_session(
            db,
            session.id,
            device_category=category,
            brand=brand_final,
            model=model_final,
            error_code=error_code_final,
            symptom=symptom_final,
            device_confidence=device_confidence,
            likely_issue=answer_json["diagnosis"]["likely_issue"],
            diagnosis_confidence=answer_json["diagnosis"]["confidence"],
            reasoning_summary=answer_json["diagnosis"]["reasoning_summary"],
            risk_level=safety_decision.risk_level,
            safety_label=safety_decision.label,
            blocked=safety_decision.blocked,
            professional_required=safety_decision.professional_required,
            warnings_json=safety_decision.warnings,
            clarifying_question=answer_json.get("clarifying_question"),
            provider_used=provider_used,
            citation_coverage=validation.citation_coverage,
        )

    total_ms = total_timer.elapsed_ms
    metrics = {
        "retrieval_latency_ms": retrieval_timer.elapsed_ms,
        "generation_latency_ms": generation_timer.elapsed_ms,
        "total_latency_ms": total_ms,
        "citation_coverage": validation.citation_coverage,
        "provider_used": provider_used,
    }

    repository.update_session(db, session.id, total_latency_ms=total_ms)

    return DiagnoseResult(
        session_id=session.id,
        diagnosis=answer_json["diagnosis"],
        safety=answer_json["safety"],
        steps=answer_json["steps"],
        clarifying_question=answer_json.get("clarifying_question"),
        sources=answer_json["sources"],
        metrics=metrics,
    )
