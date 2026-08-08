from __future__ import annotations

from uuid import UUID

from django.contrib.auth import get_user_model

from apps.career_profile.selectors import get_profile_by_user

from .models import ResumeSection, ResumeSectionItem

User = get_user_model()


def list_resume_sections(*, user: User, resume_id: UUID):
    profile = get_profile_by_user(user)
    if profile is None:
        return ResumeSection.objects.none()
    return ResumeSection.objects.select_related(
        "resume",
        "resume__career_profile",
        "resume__career_profile__user",
    ).filter(
        resume__career_profile=profile,
        resume_id=resume_id,
    )


def get_resume_section(*, user: User, resume_section_id: UUID) -> ResumeSection | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return ResumeSection.objects.select_related(
        "resume",
        "resume__career_profile",
        "resume__career_profile__user",
    ).filter(
        resume__career_profile=profile,
        id=resume_section_id,
    ).first()


def list_resume_section_items(*, user: User, resume_section_id: UUID):
    profile = get_profile_by_user(user)
    if profile is None:
        return ResumeSectionItem.objects.none()
    return ResumeSectionItem.objects.select_related(
        "resume_section",
        "resume_section__resume",
        "resume_section__resume__career_profile",
        "resume_section__resume__career_profile__user",
    ).filter(
        resume_section__resume__career_profile=profile,
        resume_section_id=resume_section_id,
    )


def get_resume_section_item(*, user: User, resume_section_item_id: UUID) -> ResumeSectionItem | None:
    profile = get_profile_by_user(user)
    if profile is None:
        return None
    return ResumeSectionItem.objects.select_related(
        "resume_section",
        "resume_section__resume",
        "resume_section__resume__career_profile",
        "resume_section__resume__career_profile__user",
    ).filter(
        resume_section__resume__career_profile=profile,
        id=resume_section_item_id,
    ).first()

