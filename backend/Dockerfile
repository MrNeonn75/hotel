FROM python:3.12-slim

# Sistem paketlərini yenilə və tələb olunan asılılıqları quraşdır
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# uv paket idarəedicisi ilə yüksək sürətli quraşdırma
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

# Asılılıq fayllarını kopyala
COPY pyproject.toml README.md ./

# Asılılıqları sistem Python mühitinə quraşdır
RUN uv pip install --system -r pyproject.toml

# Layihə kodlarını kopyala
COPY . .

# Portu aç
EXPOSE 8000

# API-ni işə sal
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

