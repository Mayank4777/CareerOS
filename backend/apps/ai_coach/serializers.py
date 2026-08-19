from __future__ import annotations

from typing import Any

from rest_framework import serializers

from apps.jobs.models import SavedJob
from .models import AIHistory, CareerRoadmap, RoadmapPhase


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
    matched_skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    coverage_percentage = serializers.IntegerField(min_value=0, max_value=100, required=False, default=100)
    gaps = serializers.ListField(child=serializers.CharField())
    recommendations = serializers.ListField(child=serializers.CharField())
    analyzed_at = serializers.DateTimeField()


class ResumeReviewRequestSerializer(serializers.Serializer):
    resume_id = serializers.UUIDField(required=True)
    enhance_with_ai = serializers.BooleanField(required=False, default=False)


class ResumeReviewRawAIResponseSerializer(serializers.Serializer):
    """Validates raw LLM qualitative review output."""

    strengths = serializers.ListField(child=serializers.CharField(allow_blank=True))
    weaknesses = serializers.ListField(child=serializers.CharField(allow_blank=True))
    recommendations = serializers.ListField(child=serializers.CharField(allow_blank=True))

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
    evidence = serializers.DictField(required=False)
    analyzed_at = serializers.DateTimeField()


class RoadmapPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapPhase
        fields = [
            "id",
            "roadmap_id",
            "title",
            "description",
            "objective",
            "skills",
            "actions",
            "status",
            "ordering",
            "estimated_duration",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "roadmap_id", "created_at", "updated_at"]

    def validate_skills(self, value: list[Any]) -> list[str]:
        if not isinstance(value, list):
            raise serializers.ValidationError("skills must be a list of strings.")
        return [str(s).strip() for s in value if str(s).strip()]

    def validate_actions(self, value: list[Any]) -> list[str]:
        if not isinstance(value, list):
            raise serializers.ValidationError("actions must be a list of strings.")
        return [str(a).strip() for a in value if str(a).strip()]


class CareerRoadmapSerializer(serializers.ModelSerializer):
    phases = RoadmapPhaseSerializer(many=True, required=False)
    target_job_id = serializers.UUIDField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = CareerRoadmap
        fields = [
            "id",
            "title",
            "description",
            "target_role",
            "target_job",
            "target_job_id",
            "status",
            "phases",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "target_job", "created_at", "updated_at"]

    def validate_target_job_id(self, value: Any) -> Any:
        if value is None:
            return None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
            if not SavedJob.objects.filter(career_profile__user=user, id=value).exists():
                raise serializers.ValidationError("Target job not found for this user.")
        return value

    def create(self, validated_data: dict[str, Any]) -> CareerRoadmap:
        phases_data = validated_data.pop("phases", [])
        target_job_id = validated_data.pop("target_job_id", None)

        user = self.context["request"].user
        career_profile = user.career_profile

        if target_job_id:
            target_job = SavedJob.objects.get(career_profile__user=user, id=target_job_id)
            validated_data["target_job"] = target_job

        roadmap = CareerRoadmap.objects.create(career_profile=career_profile, **validated_data)

        for phase_item in phases_data:
            RoadmapPhase.objects.create(roadmap=roadmap, **phase_item)

        return roadmap

    def update(self, instance: CareerRoadmap, validated_data: dict[str, Any]) -> CareerRoadmap:
        phases_data = validated_data.pop("phases", None)
        target_job_id = validated_data.pop("target_job_id", serializers.empty)

        user = self.context["request"].user

        if target_job_id is not serializers.empty:
            if target_job_id is None:
                instance.target_job = None
            else:
                target_job = SavedJob.objects.get(career_profile__user=user, id=target_job_id)
                instance.target_job = target_job

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if phases_data is not None:
            instance.phases.all().delete()
            for phase_item in phases_data:
                RoadmapPhase.objects.create(roadmap=instance, **phase_item)

        return instance
