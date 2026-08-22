from __future__ import annotations

from typing import Any

from django.db import IntegrityError, transaction
from rest_framework.exceptions import NotFound
from rest_framework.exceptions import ValidationError

from apps.resumes.selectors import get_resume

from .models import ResumeSection, ResumeSectionItem
from .selectors import (
    get_resume_section,
    get_resume_section_item,
    list_resume_section_items,
    list_resume_sections,
)


class ResumeSectionService:
    def create_resume_section(self, *, user, resume_id, data: dict[str, Any]) -> ResumeSection:
        resume = get_resume(user=user, resume_id=resume_id)
        if resume is None:
            raise NotFound("Resume not found.")

        with transaction.atomic():
            return ResumeSection.objects.create(resume=resume, **data)

    def list_resume_sections(self, *, user, resume_id):
        resume = get_resume(user=user, resume_id=resume_id)
        if resume is None:
            raise NotFound("Resume not found.")
        return list_resume_sections(user=user, resume_id=resume_id)

    def retrieve_resume_section(self, *, user, resume_section_id) -> ResumeSection:
        resume_section = get_resume_section(user=user, resume_section_id=resume_section_id)
        if resume_section is None:
            raise NotFound("Resume section not found.")
        return resume_section

    def update_resume_section(self, *, user, resume_section_id, data: dict[str, Any]) -> ResumeSection:
        resume_section = get_resume_section(user=user, resume_section_id=resume_section_id)
        if resume_section is None:
            raise NotFound("Resume section not found.")

        if not data:
            return resume_section

        for field, value in data.items():
            setattr(resume_section, field, value)

        with transaction.atomic():
            resume_section.save(update_fields=[*data.keys()])

        return resume_section

    def delete_resume_section(self, *, user, resume_section_id) -> None:
        resume_section = get_resume_section(user=user, resume_section_id=resume_section_id)
        if resume_section is None:
            raise NotFound("Resume section not found.")

        with transaction.atomic():
            resume_section.delete()


class ResumeSectionItemService:
    def create_resume_section_item(self, *, user, resume_section_id, data: dict[str, Any]) -> ResumeSectionItem:
        resume_section = get_resume_section(user=user, resume_section_id=resume_section_id)
        if resume_section is None:
            raise NotFound("Resume section not found.")

        if ResumeSectionItem.objects.filter(
            resume_section=resume_section,
            source_object_id=data["source_object_id"],
        ).exists():
            raise ValidationError(
                {"source_object_id": "This source record is already included in this resume section."}
            )

        try:
            with transaction.atomic():
                return ResumeSectionItem.objects.create(resume_section=resume_section, **data)
        except IntegrityError as exc:
            raise ValidationError(
                {"source_object_id": "This source record is already included in this resume section."}
            ) from exc

    def list_resume_section_items(self, *, user, resume_section_id):
        resume_section = get_resume_section(user=user, resume_section_id=resume_section_id)
        if resume_section is None:
            raise NotFound("Resume section not found.")
        return list_resume_section_items(user=user, resume_section_id=resume_section_id)

    def retrieve_resume_section_item(self, *, user, resume_section_item_id) -> ResumeSectionItem:
        resume_section_item = get_resume_section_item(user=user, resume_section_item_id=resume_section_item_id)
        if resume_section_item is None:
            raise NotFound("Resume section item not found.")
        return resume_section_item

    def update_resume_section_item(self, *, user, resume_section_item_id, data: dict[str, Any]) -> ResumeSectionItem:
        resume_section_item = get_resume_section_item(user=user, resume_section_item_id=resume_section_item_id)
        if resume_section_item is None:
            raise NotFound("Resume section item not found.")

        if not data:
            return resume_section_item

        for field, value in data.items():
            setattr(resume_section_item, field, value)

        with transaction.atomic():
            resume_section_item.save(update_fields=[*data.keys()])

        return resume_section_item

    def delete_resume_section_item(self, *, user, resume_section_item_id) -> None:
        resume_section_item = get_resume_section_item(user=user, resume_section_item_id=resume_section_item_id)
        if resume_section_item is None:
            raise NotFound("Resume section item not found.")

        with transaction.atomic():
            resume_section_item.delete()
