import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.evals.run_evals import run_evaluation_suite


def main() -> None:
    summary = run_evaluation_suite()
    print(json.dumps(summary, indent=2))
    print("\nFull report written to backend/reports/eval_report.md")


if __name__ == "__main__":
    main()
