FROM python:3.11-slim

WORKDIR /app

# Copy application files
COPY . .

# Expose port
EXPOSE 3004

# Environment variables
ENV PYTHONUNBUFFERED=1

# Run the frontend server
CMD ["python", "serve.py"]
