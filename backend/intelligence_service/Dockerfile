FROM python:3.11-slim

WORKDIR /app

COPY backend/shared/ /app/shared/
COPY backend/intelligence_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/intelligence_service/ /app/intelligence_service/

CMD ["uvicorn", "intelligence_service.main:app", "--host", "0.0.0.0", "--port", "8002"]
