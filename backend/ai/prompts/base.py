from __future__ import annotations

from typing import Any


class PromptTemplate:
    """Base class for versioned prompt templates."""

    def __init__(self, system_template: str, user_template: str, version: str = "1.0") -> None:
        self.system_template = system_template
        self.user_template = user_template
        self.version = version

    def format(self, context: dict[str, Any], prompt_input: str = "", **kwargs: Any) -> tuple[str, str]:
        """Format system and user templates with supplied context and input."""
        merged = {**context, "input": prompt_input, **kwargs}

        # Safe formatting handling missing key placeholders gracefully
        system_prompt = self.system_template
        for key, val in merged.items():
            system_prompt = system_prompt.replace(f"{{{key}}}", str(val))

        user_prompt = self.user_template
        for key, val in merged.items():
            user_prompt = user_prompt.replace(f"{{{key}}}", str(val))

        return system_prompt, user_prompt


class TestPromptTemplate(PromptTemplate):
    """Minimal infrastructure test prompt template."""

    def __init__(self) -> None:
        super().__init__(
            system_template="You are a helpful AI assistant for CareerOS. Candidate: {candidate_name}.",
            user_template="{input}",
            version="1.0",
        )
