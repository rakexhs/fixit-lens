from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(BACKEND_DIR / ".env"), extra="ignore")

    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    database_url: str = f"sqlite:///{BACKEND_DIR / 'fixit_lens.db'}"
    app_env: str = "development"
    demo_mode: bool = False

    provider_priority: str = "gemini,openai,mock"

    gemini_api_key: str = ""
    gemini_vision_model: str = "gemini-3.5-flash"
    gemini_text_model: str = "gemini-3.5-flash"

    openai_api_key: str = ""
    openai_vision_model: str = "gpt-4o-mini"
    openai_text_model: str = "gpt-4o-mini"

    use_local_heavy_models: bool = False
    use_local_embeddings: bool = False

    max_image_mb: int = 8
    image_storage_dir: str = str(BACKEND_DIR / "data" / "uploads")

    safety_strict_mode: bool = True
    require_citations: bool = True

    expo_public_api_base_url: str = "http://127.0.0.1:8000"

    @field_validator("database_url")
    @classmethod
    def _anchor_relative_sqlite_path(cls, value: str) -> str:
        """Resolve relative sqlite:/// paths against BACKEND_DIR, not the process cwd.

        Scripts and Makefile targets invoke the backend from different working
        directories (repo root vs backend/), so a relative path here must not
        depend on where the process happened to be launched from.
        """
        prefix = "sqlite:///"
        if value.startswith(prefix):
            raw_path = value[len(prefix) :]
            if raw_path and not raw_path.startswith("/"):
                absolute_path = (BACKEND_DIR / raw_path).resolve()
                return f"{prefix}{absolute_path}"
        return value

    @property
    def provider_order(self) -> list[str]:
        return [p.strip() for p in self.provider_priority.split(",") if p.strip()]

    @property
    def data_dir(self) -> Path:
        return BACKEND_DIR / "data"

    @property
    def manuals_dir(self) -> Path:
        return self.data_dir / "manuals"

    @property
    def demo_images_dir(self) -> Path:
        return self.data_dir / "demo_images"

    @property
    def eval_dir(self) -> Path:
        return self.data_dir / "eval"

    @property
    def safety_rules_path(self) -> Path:
        return Path(__file__).resolve().parent / "safety" / "safety_rules.yaml"

    @property
    def reports_dir(self) -> Path:
        return BACKEND_DIR / "reports"


@lru_cache
def get_settings() -> Settings:
    return Settings()
