import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml

FRONT_MATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)
HEADING_RE = re.compile(r"^##\s+(.*)$", re.MULTILINE)


@dataclass
class ManualSection:
    heading: str
    text: str


@dataclass
class ParsedManual:
    manual_id: str
    title: str
    category: str | None
    brand: str | None
    model: str | None
    error_codes: list[str]
    is_safety: bool
    sections: list[ManualSection] = field(default_factory=list)


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "section"


def parse_manual_text(manual_id: str, raw_text: str) -> ParsedManual:
    match = FRONT_MATTER_RE.match(raw_text)
    meta: dict = {}
    body = raw_text
    if match:
        meta = yaml.safe_load(match.group(1)) or {}
        body = match.group(2)

    title = meta.get("title") or manual_id.replace("_", " ").title()
    category = meta.get("category")
    brand = meta.get("brand")
    model = meta.get("model")
    error_codes = meta.get("error_codes") or []
    is_safety = bool(meta.get("safety", False))

    sections: list[ManualSection] = []
    headings = list(HEADING_RE.finditer(body))
    if not headings:
        sections.append(ManualSection(heading="Overview", text=body.strip()))
    else:
        for idx, heading_match in enumerate(headings):
            heading = heading_match.group(1).strip()
            start = heading_match.end()
            end = headings[idx + 1].start() if idx + 1 < len(headings) else len(body)
            text = body[start:end].strip()
            if text:
                sections.append(ManualSection(heading=heading, text=text))

    return ParsedManual(
        manual_id=manual_id,
        title=title,
        category=category,
        brand=brand,
        model=model,
        error_codes=[str(c) for c in error_codes],
        is_safety=is_safety,
        sections=sections,
    )


def parse_manual_file(path: Path) -> ParsedManual:
    manual_id = path.stem
    raw_text = path.read_text(encoding="utf-8")
    return parse_manual_text(manual_id, raw_text)


def slugify(text: str) -> str:
    return _slugify(text)
