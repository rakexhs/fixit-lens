import time
from contextlib import contextmanager


class Timer:
    def __init__(self) -> None:
        self.elapsed_ms: float = 0.0

    @contextmanager
    def measure(self):
        start = time.perf_counter()
        try:
            yield self
        finally:
            self.elapsed_ms = round((time.perf_counter() - start) * 1000, 3)
