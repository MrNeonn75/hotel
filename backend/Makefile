.PHONY: help install run migrate seed test lint docker-up docker-down docker-logs

help:
	@echo "StayNow Backend Komandaları:"
	@echo "  make install    - uv ilə asılılıqları quraşdırır"
	@echo "  make run        - Uvicorn dev serveri işə salır (reload rejimində)"
	@echo "  make migrate    - Alembic miqrasiyalarını tətbiq edir"
	@echo "  make seed       - Bakı otellərini bazaya doldurur"
	@echo "  make test       - Pytest testlərini icra edir"
	@echo "  make lint       - Ruff ilə kod keyfiyyətini yoxlayır"
	@echo "  make docker-up  - Docker Compose ilə PostgreSQL və API-ni qaldırır"
	@echo "  make docker-down- Docker Compose konteynerlərini dayandırır"

install:
	uv pip install -e ".[dev]"

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

migrate:
	alembic upgrade head

seed:
	python scripts/seed.py

test:
	pytest -v

lint:
	ruff check .
	ruff format --check .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f api

