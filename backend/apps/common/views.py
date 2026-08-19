from __future__ import annotations

from typing import Any

from django.conf import settings
from django.db import connection
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckAPIView(APIView):
    """
    Lightweight, unauthenticated production health check endpoint.
    GET /api/v1/health/
    """

    permission_classes = [AllowAny]
    throttle_classes = []

    def get(self, request: Any) -> Response:
        db_status = "ok"
        redis_status = "disabled"

        # Check Database Connectivity
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_status = "error"

        # Check Redis Connectivity if enabled via settings
        use_redis = getattr(settings, "USE_REDIS", False) or getattr(
            settings, "CACHES", {}
        ).get("default", {}).get("BACKEND", "").endswith("RedisCache")

        if use_redis:
            try:
                from django.core.cache import cache

                cache.set("_health_check", "ok", timeout=5)
                val = cache.get("_health_check")
                if val == "ok":
                    redis_status = "ok"
                else:
                    redis_status = "error"
            except Exception:
                redis_status = "error"

        is_healthy = (db_status == "ok") and (redis_status in {"ok", "disabled"})
        http_status = (
            status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        )

        response_payload = {
            "status": "ok" if is_healthy else "unhealthy",
            "database": db_status,
            "redis": redis_status,
        }

        return Response(response_payload, status=http_status)
