from __future__ import annotations

from typing import Any

from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.career_profile.selectors import get_profile_by_user

from .models import Publication
from .selectors import get_publication, list_publications


class PublicationService:
    def create_publication(self, *, user, data: dict[str, Any]) -> Publication:
        profile = get_profile_by_user(user)
        if profile is None:
            raise NotFound("Career profile not found.")

        with transaction.atomic():
            return Publication.objects.create(career_profile=profile, **data)

    def list_publications(self, *, user):
        return list_publications(user=user)

    def retrieve_publication(self, *, user, publication_id) -> Publication:
        publication = get_publication(user=user, publication_id=publication_id)
        if publication is None:
            raise NotFound("Publication not found.")
        return publication

    def update_publication(self, *, user, publication_id, data: dict[str, Any]) -> Publication:
        publication = get_publication(user=user, publication_id=publication_id)
        if publication is None:
            raise NotFound("Publication not found.")

        for field, value in data.items():
            setattr(publication, field, value)

        with transaction.atomic():
            publication.save(update_fields=[*data.keys(), "updated_at"])

        return publication

    def delete_publication(self, *, user, publication_id) -> None:
        publication = get_publication(user=user, publication_id=publication_id)
        if publication is None:
            raise NotFound("Publication not found.")

        with transaction.atomic():
            publication.delete()
