from __future__ import annotations

from typing import Any

from rest_framework import serializers

from .models import AIHistory

REQUIRED_RESUME_REVIEW_DIMENSIONS = [
    "completeness",
    "content_quality",
    "experience_quality",
    "projects_achievements",
    "skills_presentation",
    "target_role_relevance",
    "professional_presentation",
]

RESUME_REVIEW_DIMENSION_WEIGHTS = {
    "completeness": 0.20,
    "content_quality": 0.20,
    "experience_quality": 0.15,
    "projects_achievements": 0.15,
    "skills_presentation": 0.10,
    "target_role_relevance": 0.10,
    "professional_presentation": 0.10,
}

RESUME_REVIEW_DIMENSION_POINTS = {
    "completeness": 20,
    "content_quality": 20,
    "experience_quality": 15,
    "projects_achievements": 15,
    "skills_presentation": 10,
    "target_role_relevance": 10,
    "professional_presentation": 10,
}


def calculate_resume_review_score(dimensions: dict[str, dict[str, Any]]) -> int:
    """Calculates deterministic 0-100 score from 7 validated 0-10 integer dimensions."""
    total_points = sum(
        dimensions[dim]["score"] * points
        for dim, points in RESUME_REVIEW_DIMENSION_POINTS.items()
    )
    score_100 = (total_points + 5) // 10
    return max(0, min(100, score_100))



class AIHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AIHistory
        fields = [
            "id",
            "feature",
            "provider",
            "model",
            "prompt_tokens",
            "completion_tokens",
            "total_tokens",
            "response_data",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class AIChatSerializer(serializers.Serializer):
    feature = serializers.ChoiceField(
        choices=[
            "career_chat",
            "resume_review",
            "ats_review",
            "interview_prep",
            "cover_letter",
            "job_match",
        ],
        default="career_chat",
    )
    prompt = serializers.CharField(min_length=1, max_length=10000)


class CoverLetterRequestSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    job_title = serializers.CharField(max_length=255)
    job_description = serializers.CharField(required=False, allow_blank=True, default="")
    tone = serializers.ChoiceField(
        choices=["professional", "enthusiastic", "concise", "creative"],
        default="professional",
    )


class CareerAdviceSerializer(serializers.Serializer):
    target_role = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    industry = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")


class SkillGapSerializer(serializers.Serializer):
    target_role = serializers.CharField(max_length=255)
    required_skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class JobMatchSerializer(serializers.Serializer):
    job_id = serializers.UUIDField(required=True)
    resume_id = serializers.UUIDField(required=True)


class JobMatchResultSerializer(serializers.Serializer):
    match_score = serializers.IntegerField(min_value=0, max_value=100)
    strengths = serializers.ListField(child=serializers.CharField(allow_blank=True))
    missing_skills = serializers.ListField(child=serializers.CharField(allow_blank=True))
    gaps = serializers.ListField(child=serializers.CharField(allow_blank=True))
    recommendations = serializers.ListField(child=serializers.CharField(allow_blank=True))

    def validate_match_score(self, value: int) -> int:
        raw_val = self.initial_data.get("match_score")
        if type(raw_val) is not int or isinstance(raw_val, bool):
            raise serializers.ValidationError("match_score must be an integer between 0 and 100.")
        return value

    def validate_strengths(self, value: list[str]) -> list[str]:
        raw_val = self.initial_data.get("strengths")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("strengths must be a list of strings.")
        return value

    def validate_missing_skills(self, value: list[str]) -> list[str]:
        raw_val = self.initial_data.get("missing_skills")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("missing_skills must be a list of strings.")
        return value

    def validate_gaps(self, value: list[str]) -> list[str]:
        raw_val = self.initial_data.get("gaps")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("gaps must be a list of strings.")
        return value

    def validate_recommendations(self, value: list[str]) -> list[str]:
        raw_val = self.initial_data.get("recommendations")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("recommendations must be a list of strings.")
        return value


class JobMatchResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    job_id = serializers.UUIDField()
    resume_id = serializers.UUIDField()
    match_score = serializers.IntegerField(min_value=0, max_value=100)
    strengths = serializers.ListField(child=serializers.CharField())
    missing_skills = serializers.ListField(child=serializers.CharField())
    gaps = serializers.ListField(child=serializers.CharField())
    recommendations = serializers.ListField(child=serializers.CharField())
    analyzed_at = serializers.DateTimeField()


class ResumeReviewRequestSerializer(serializers.Serializer):
    resume_id = serializers.UUIDField(required=True)


class ResumeReviewRawAIResponseSerializer(serializers.Serializer):
    """Validates raw LLM dimensional review output."""

    dimensions = serializers.DictField(required=True)
    strengths = serializers.ListField(child=serializers.CharField(allow_blank=True))
    weaknesses = serializers.ListField(child=serializers.CharField(allow_blank=True))
    recommendations = serializers.ListField(child=serializers.CharField(allow_blank=True))

    def validate_dimensions(self, value: dict[str, Any]) -> dict[str, Any]:
        raw_val = self.initial_data.get("dimensions")
        if not isinstance(raw_val, dict):
            raise serializers.ValidationError("dimensions must be a dictionary.")

        for req_dim in REQUIRED_RESUME_REVIEW_DIMENSIONS:
            if req_dim not in raw_val:
                raise serializers.ValidationError(f"Missing required dimension '{req_dim}'.")

            dim_data = raw_val[req_dim]
            if not isinstance(dim_data, dict):
                raise serializers.ValidationError(f"Dimension '{req_dim}' must be an object.")

            if "score" not in dim_data:
                raise serializers.ValidationError(f"Dimension '{req_dim}' is missing 'score'.")

            score = dim_data["score"]
            if type(score) is not int or isinstance(score, bool):
                raise serializers.ValidationError(
                    f"Dimension '{req_dim}' score must be an integer between 0 and 10."
                )

            if score < 0 or score > 10:
                raise serializers.ValidationError(
                    f"Dimension '{req_dim}' score must be an integer between 0 and 10."
                )

            if "evidence" not in dim_data:
                raise serializers.ValidationError(f"Dimension '{req_dim}' is missing 'evidence'.")

            evidence = dim_data["evidence"]
            if not isinstance(evidence, str) or not evidence.strip():
                raise serializers.ValidationError(
                    f"Dimension '{req_dim}' evidence must be a non-empty string."
                )

        return value

    def validate_strengths(self, value: list[str]) -> list[str]:
        raw_val = self.initial_data.get("strengths")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("strengths must be a list of strings.")
        return value

    def validate_weaknesses(self, value: list[str]) -> list[str]:
        raw_val = self.initial_data.get("weaknesses")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("weaknesses must be a list of strings.")
        return value

    def validate_recommendations(self, value: list[str]) -> list[str]:
        raw_val = self.initial_data.get("recommendations")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("recommendations must be a list of strings.")
        return value


class ResumeReviewResultSerializer(serializers.Serializer):
    score = serializers.IntegerField(min_value=0, max_value=100)
    strengths = serializers.ListField(child=serializers.CharField(allow_blank=True))
    weaknesses = serializers.ListField(child=serializers.CharField(allow_blank=True))
    recommendations = serializers.ListField(child=serializers.CharField(allow_blank=True))


class ResumeReviewResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    resume_id = serializers.UUIDField()
    score = serializers.IntegerField(min_value=0, max_value=100)
    strengths = serializers.ListField(child=serializers.CharField())
    weaknesses = serializers.ListField(child=serializers.CharField())
    recommendations = serializers.ListField(child=serializers.CharField())
    analyzed_at = serializers.DateTimeField()


class SkillGapJobRequestSerializer(serializers.Serializer):
    job_id = serializers.UUIDField(required=True)


class SkillGapResultSerializer(serializers.Serializer):
    matched_skills = serializers.ListField(child=serializers.CharField(allow_blank=True))
    missing_skills = serializers.ListField(child=serializers.DictField())
    partial_skills = serializers.ListField(child=serializers.DictField())

    def validate_matched_skills(self, value: list[Any]) -> list[str]:
        raw_val = self.initial_data.get("matched_skills")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("matched_skills must be a list of strings.")
        out = []
        for item in raw_val:
            if not isinstance(item, str) or not item.strip():
                raise serializers.ValidationError("Skill names in matched_skills must be non-empty strings.")
            out.append(item.strip())
        return list(dict.fromkeys(out))

    def validate_missing_skills(self, value: list[Any]) -> list[dict[str, Any]]:
        raw_val = self.initial_data.get("missing_skills")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("missing_skills must be a list.")
        out = []
        seen = set()
        for item in raw_val:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Items in missing_skills must be objects.")
            skill = item.get("skill")
            importance = item.get("importance")
            reason = item.get("reason")
            recommendation = item.get("recommendation")

            if not isinstance(skill, str) or not skill.strip():
                raise serializers.ValidationError("missing_skills item missing valid 'skill' string.")
            if not isinstance(importance, str) or importance.lower() not in ["high", "medium", "low"]:
                raise serializers.ValidationError("missing_skills importance must be 'high', 'medium', or 'low'.")
            if not isinstance(reason, str) or not reason.strip():
                raise serializers.ValidationError("missing_skills item missing valid 'reason' string.")
            if not isinstance(recommendation, str) or not recommendation.strip():
                raise serializers.ValidationError("missing_skills item missing valid 'recommendation' string.")

            from apps.jobs.skill_gap import normalize_skill
            skill_norm = normalize_skill(skill)
            if skill_norm in seen:
                continue
            seen.add(skill_norm)

            out.append({
                "skill": skill.strip(),
                "importance": importance.lower(),
                "reason": reason.strip(),
                "recommendation": recommendation.strip(),
            })
        return out

    def validate_partial_skills(self, value: list[Any]) -> list[dict[str, Any]]:
        raw_val = self.initial_data.get("partial_skills")
        if not isinstance(raw_val, list):
            raise serializers.ValidationError("partial_skills must be a list.")
        out = []
        seen = set()
        for item in raw_val:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Items in partial_skills must be objects.")
            skill = item.get("skill")
            reason = item.get("reason")
            recommendation = item.get("recommendation")

            if not isinstance(skill, str) or not skill.strip():
                raise serializers.ValidationError("partial_skills item missing valid 'skill' string.")
            if not isinstance(reason, str) or not reason.strip():
                raise serializers.ValidationError("partial_skills item missing valid 'reason' string.")
            if not isinstance(recommendation, str) or not recommendation.strip():
                raise serializers.ValidationError("partial_skills item missing valid 'recommendation' string.")

            from apps.jobs.skill_gap import normalize_skill
            skill_norm = normalize_skill(skill)
            if skill_norm in seen:
                continue
            seen.add(skill_norm)

            out.append({
                "skill": skill.strip(),
                "reason": reason.strip(),
                "recommendation": recommendation.strip(),
            })
        return out

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        from apps.jobs.skill_gap import normalize_skill
        matched = attrs.get("matched_skills", [])
        missing = attrs.get("missing_skills", [])
        partial = attrs.get("partial_skills", [])

        matched_norms = {normalize_skill(s) for s in matched}

        filtered_missing = [item for item in missing if normalize_skill(item["skill"]) not in matched_norms]
        missing_norms = {normalize_skill(item["skill"]) for item in filtered_missing}

        filtered_partial = [
            item for item in partial
            if normalize_skill(item["skill"]) not in matched_norms and normalize_skill(item["skill"]) not in missing_norms
        ]

        attrs["matched_skills"] = matched
        attrs["missing_skills"] = filtered_missing
        attrs["partial_skills"] = filtered_partial
        return attrs


class SkillGapJobResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    job_id = serializers.UUIDField()
    matched_skills = serializers.ListField(child=serializers.CharField())
    missing_skills = serializers.ListField(child=serializers.DictField())
    partial_skills = serializers.ListField(child=serializers.DictField())
    recommendations = serializers.ListField(child=serializers.CharField())
    analyzed_at = serializers.DateTimeField()

