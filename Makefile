BACKEND_DIR := backend
MOBILE_DIR := mobile
VENV := $(BACKEND_DIR)/.venv
PYTHON := $(CURDIR)/$(VENV)/bin/python
PIP := $(CURDIR)/$(VENV)/bin/pip

.PHONY: setup seed backend backend-lan mobile web ios ios-prebuild ios-native ios-native-open test eval demo clean assets

setup:
	@echo "==> Creating backend virtualenv"
	@if [ ! -x "$(PYTHON)" ]; then \
		python3 -m venv "$(VENV)" 2>/dev/null || { \
			echo "!! This path contains characters unsupported by venv (e.g. ':'). Creating the venv outside the project and symlinking it in."; \
			EXTERNAL_VENV="$$HOME/.venvs/fixit-lens-backend"; \
			python3 -m venv "$$EXTERNAL_VENV"; \
			ln -sfn "$$EXTERNAL_VENV" "$(VENV)"; \
		}; \
	fi
	$(PIP) install --upgrade pip -q
	$(PIP) install -r $(BACKEND_DIR)/requirements-dev.txt
	@if [ ! -f "$(BACKEND_DIR)/.env" ]; then cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; fi
	@echo "==> Installing mobile dependencies"
	cd $(MOBILE_DIR) && npm install

seed:
	$(PYTHON) $(BACKEND_DIR)/scripts/generate_demo_images.py
	$(PYTHON) $(BACKEND_DIR)/scripts/seed_sample_data.py
	$(PYTHON) $(BACKEND_DIR)/scripts/build_index.py

backend:
	cd $(BACKEND_DIR) && $(PYTHON) -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

backend-lan:
	@echo "==> Starting backend on all interfaces (for iPhone on same Wi‑Fi)"
	@echo "    Set EXPO_PUBLIC_API_BASE_URL in mobile/.env to http://<your-mac-lan-ip>:8000"
	cd $(BACKEND_DIR) && $(PYTHON) -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

mobile:
	cd $(MOBILE_DIR) && npx expo start

ios:
	cd $(MOBILE_DIR) && npx expo start --ios

ios-prebuild:
	cd $(MOBILE_DIR) && npx expo prebuild --platform ios --clean
	@echo "==> Open mobile/ios/FixItLens.xcworkspace in Xcode, select your team, then Run."

ios-native:
	cd ios-native && python3 scripts/generate_xcode_project.py
	@echo "==> Open ios-native/FixItLens.xcodeproj in Xcode and press Run (⌘R)."
	@echo "    Tip: if build fails due to path colons, set SYMROOT in Xcode to /tmp/fixit-lens-build"

ios-native-open:
	cd ios-native && python3 scripts/generate_xcode_project.py && open FixItLens.xcodeproj

assets:
	$(PYTHON) $(MOBILE_DIR)/scripts/generate_app_icon.py

web:
	cd $(MOBILE_DIR) && npx expo start --web

test:
	cd $(BACKEND_DIR) && $(PYTHON) -m pytest -q
	@if [ -d "$(MOBILE_DIR)/node_modules" ]; then \
		cd $(MOBILE_DIR) && npx tsc --noEmit && npx eslint .; \
	else \
		echo "Skipping mobile typecheck/lint: run 'make setup' first."; \
	fi

eval:
	cd $(BACKEND_DIR) && $(PYTHON) scripts/run_evals.py

demo: seed
	cd $(BACKEND_DIR) && $(PYTHON) scripts/smoke_test.py
	@echo ""
	@echo "==> Demo ready. Next steps:"
	@echo "    Terminal 1: make backend"
	@echo "    Terminal 2: make mobile   (or: make web)"
	@echo ""
	@echo "Try these demo images from backend/data/demo_images/ via the camera/upload flow:"
	@echo "  tp_link_ax55_red_led.png, bosch_dishwasher_e24.png, lg_washer_oe.png,"
	@echo "  laptop_fan_noise.png, microwave_capacitor_warning.png (blocked), blurry_router.png (retake)"

clean:
	find . -type d -name "__pycache__" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	rm -rf $(BACKEND_DIR)/.pytest_cache
	rm -f $(BACKEND_DIR)/fixit_lens.db $(BACKEND_DIR)/test_fixit_lens.db
	rm -rf $(MOBILE_DIR)/.expo
	@echo "Cleaned caches, local databases, and temp files."
