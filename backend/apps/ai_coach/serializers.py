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
    job_title = serializers.CharField(max_length=255)
    company_name = serializers.CharField(max_length=255)
    job_description = serializers.CharField(required=False, allow_blank=True, default="")
