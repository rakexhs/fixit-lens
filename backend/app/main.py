import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import (
    routes_analyze,
    routes_diagnose,
    routes_feedback,
    routes_health,
    routes_manuals,
    routes_metrics,
    routes_sessions,
)
from app.config import get_settings
from app.db.database import SessionLocal, init_db
from app.manuals.indexer import rebuild_global_index_from_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        n_chunks = rebuild_global_index_from_db(db)
        logger.info("Loaded %d manual chunks into the hybrid retrieval index", n_chunks)
    finally:
        db.close()
    yield


app = FastAPI(title="FixIt Lens API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})


app.include_router(routes_health.router)
app.include_router(routes_analyze.router)
app.include_router(routes_diagnose.router)
app.include_router(routes_manuals.router)
app.include_router(routes_feedback.router)
app.include_router(routes_sessions.router)
app.include_router(routes_metrics.router)


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run("app.main:app", host=settings.backend_host, port=settings.backend_port, reload=True)
