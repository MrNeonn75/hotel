.PHONY: seed migrate test lint run install docker-up docker-down

install:
	cd backend && uv pip install -e ".[dev]"

run:
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

migrate:
	cd backend && alembic upgrade head

seed:
	cd backend && python scripts/seed.py

test:
	cd backend && pytest -v

lint:
	cd backend && ruff check .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

