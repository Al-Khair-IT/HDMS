# Communication Service Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ .

# Add shared directory to Python path
ENV PYTHONPATH="${PYTHONPATH}:/shared"

# Expose port
EXPOSE 8003

# Run migrations and start ASGI server
CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && daphne -b 0.0.0.0 -p 8003 core.asgi:application"]
