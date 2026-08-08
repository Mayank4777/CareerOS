from __future__ import annotations

from apps.career_profile.models import CareerProfile

from .models import Application
from .selectors import get_user_applications


class ApplicationService:
    def list_applications(self, user):
        return get_user_applications(user)

    def create_application(self, user, data: dict) -> Application:
        profile, _ = CareerProfile.objects.get_or_create(user=user)
        return Application.objects.create(career_profile=profile, **data)

    def retrieve_application(self, user, application_id) -> Application:
        profile, _ = CareerProfile.objects.get_or_create(user=user)
        return Application.objects.get(career_profile=profile, id=application_id)

    def update_application(self, user, application_id, data: dict) -> Application:
        app = self.retrieve_application(user, application_id)
        for key, value in data.items():
            setattr(app, key, value)
        app.save()
        return app

    def delete_application(self, user, application_id) -> None:
        app = self.retrieve_application(user, application_id)
        app.delete()
