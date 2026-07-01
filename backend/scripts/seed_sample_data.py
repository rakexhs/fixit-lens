import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from app.db import repository
from app.db.database import SessionLocal, init_db
from app.manuals.loader import load_manual_chunks_from_dir


def main() -> None:
    settings = get_settings()
    init_db()

    chunks = load_manual_chunks_from_dir(settings.manuals_dir)
    db = SessionLocal()
    try:
        count = repository.bulk_upsert_manual_chunks(db, chunks)
    finally:
        db.close()

    print(f"Seeded {count} manual chunks from {settings.manuals_dir}")


if __name__ == "__main__":
    main()
