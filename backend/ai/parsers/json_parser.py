from __future__ import annotations

import json
import re
from typing import Any

from .base import AIResponseParsingError, AISchemaValidationError, BaseResponseParser


class JSONResponseParser(BaseResponseParser):
    """Parser for structured JSON AI responses with required key validation."""

    def __init__(self, required_fields: list[str] | None = None) -> None:
        self.required_fields = required_fields or []

    def parse(self, text: str) -> dict[str, Any]:
        cleaned_text = text.strip()

        # Handle markdown JSON codeblocks (e.g. ```json { ... } ``` or ``` { ... } ```)
        json_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned_text, re.IGNORECASE)
        if json_block_match:
            cleaned_text = json_block_match.group(1).strip()

        try:
            data = json.loads(cleaned_text)
        except json.JSONDecodeError as exc:
            raise AIResponseParsingError(f"Raw text output is not valid JSON: {exc.msg}") from exc

        if not isinstance(data, dict):
            raise AIResponseParsingError("JSON response must be a top-level dictionary object.")

        if self.required_fields:
            missing = [field for field in self.required_fields if field not in data]
            if missing:
                missing_str = ", ".join(missing)
                raise AISchemaValidationError(f"JSON response is missing required fields: {missing_str}.")

        return data
