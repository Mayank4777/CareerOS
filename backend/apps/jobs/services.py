from __future__ import annotations

from apps.career_profile.models import CareerProfile

from .models import SavedJob
from .selectors import get_user_saved_jobs


class JobService:
    def list_saved_jobs(self, user):
        return get_user_saved_jobs(user)

    def create_saved_job(self, user, data: dict) -> SavedJob:
        profile, _ = CareerProfile.objects.get_or_create(user=user)
        return SavedJob.objects.create(career_profile=profile, **data)

    def retrieve_saved_job(self, user, job_id) -> SavedJob:
        profile, _ = CareerProfile.objects.get_or_create(user=user)
        return SavedJob.objects.get(career_profile=profile, id=job_id)

    def update_saved_job(self, user, job_id, data: dict) -> SavedJob:
        job = self.retrieve_saved_job(user, job_id)
        for key, value in data.items():
            setattr(job, key, value)
        job.save()
        return job

    def delete_saved_job(self, user, job_id) -> None:
        job = self.retrieve_saved_job(user, job_id)
        job.delete()
