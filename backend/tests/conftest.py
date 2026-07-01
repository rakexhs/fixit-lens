import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

TEST_DB_PATH = BACKEND_DIR / "test_fixit_lens.db"
if TEST_DB_PATH.exists():
    TEST_DB_PATH.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

import pytest  # noqa: E402

from app.config import get_settings  # noqa: E402
from app.db import repository  # noqa: E402
from app.db.database import SessionLocal, init_db  # noqa: E402
from app.manuals.indexer import rebuild_global_index_from_db  # noqa: E402
from app.manuals.loader import load_manual_chunks_from_dir  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _setup_test_db():
    init_db()
    settings = get_settings()
    chunks = load_manual_chunks_from_dir(settings.manuals_dir)
    db = SessionLocal()
    try:
        repository.bulk_upsert_manual_chunks(db, chunks)
        rebuild_global_index_from_db(db)
    finally:
        db.close()
    yield
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
