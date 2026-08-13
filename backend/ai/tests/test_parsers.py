from __future__ import annotations

from django.test import TestCase

from ai.parsers import AIResponseParsingError, AISchemaValidationError, JSONResponseParser


class JSONResponseParserTests(TestCase):
    def setUp(self) -> None:
        self.parser = JSONResponseParser(required_fields=["score", "status"])

    def test_plain_json_parsing_success(self) -> None:
        raw_text = '{"score": 95, "status": "approved", "notes": "Great profile"}'
        parsed = self.parser.parse(raw_text)
        self.assertEqual(parsed["score"], 95)
        self.assertEqual(parsed["status"], "approved")

    def test_markdown_codeblock_json_parsing_success(self) -> None:
        raw_text = """Here is your review:
```json
{
  "score": 88,
  "status": "in_review",
  "summary": "Looks good"
}
```
Hope this helps!"""
        parsed = self.parser.parse(raw_text)
        self.assertEqual(parsed["score"], 88)

    def test_malformed_json_raises_parsing_error(self) -> None:
        raw_text = '{"score": 90, status: invalid json}'
        with self.assertRaises(AIResponseParsingError):
            self.parser.parse(raw_text)

    def test_missing_required_fields_raises_schema_validation_error(self) -> None:
        raw_text = '{"score": 80}'  # Missing "status"
        with self.assertRaises(AISchemaValidationError):
            self.parser.parse(raw_text)
