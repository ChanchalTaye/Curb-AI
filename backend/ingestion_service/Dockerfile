FROM python:3.11-slim

WORKDIR /app

COPY backend/shared/ /app/shared/
COPY backend/ingestion_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ingestion_service/ /app/ingestion_service/

CMD ["uvicorn", "ingestion_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
