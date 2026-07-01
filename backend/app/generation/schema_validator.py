from pydantic import ValidationError

from app.schemas import GeneratedAnswer


def validate_answer_json(data: dict) -> tuple[GeneratedAnswer | None, list[str]]:
    try:
        answer = GeneratedAnswer.model_validate(data)
        return answer, []
    except ValidationError as exc:
        return None, [str(err) for err in exc.errors()]
