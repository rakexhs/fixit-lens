import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import SessionLocal, init_db
from app.manuals.indexer import rebuild_global_index_from_db


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        count = rebuild_global_index_from_db(db)
    finally:
        db.close()
    print(f"Built hybrid retrieval index with {count} chunks")


if __name__ == "__main__":
    main()
