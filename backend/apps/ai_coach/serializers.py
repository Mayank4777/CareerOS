from __future__ import annotations

from rest_framework import serializers

from .models import AIHistory


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
