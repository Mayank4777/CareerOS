from __future__ import annotations

from apps.applications.models import Application
from apps.career_profile.models import CareerProfile

from .models import Interview
from .selectors import get_user_interviews


class InterviewService:
    def list_interviews(self, user):
        return get_user_interviews(user)

    def create_interview(self, user, data: dict) -> Interview:
        profile, _ = CareerProfile.objects.get_or_create(user=user)
        application = data.get("application")
        if application and application.career_profile != profile:
            raise ValueError("Invalid application owner")
        return Interview.objects.create(**data)

    def retrieve_interview(self, user, interview_id) -> Interview:
        profile, _ = CareerProfile.objects.get_or_create(user=user)
        return Interview.objects.select_related("application").get(
            application__career_profile=profile, id=interview_id
        )

    def update_interview(self, user, interview_id, data: dict) -> Interview:
        interview = self.retrieve_interview(user, interview_id)
        for key, value in data.items():
            setattr(interview, key, value)
        interview.save()
        return interview

    def delete_interview(self, user, interview_id) -> None:
        interview = self.retrieve_interview(user, interview_id)
        interview.delete()
