from __future__ import annotations

from django.test.runner import DiscoverRunner
from django.test.utils import override_settings


class FastTestRunner(DiscoverRunner):
    """Custom test runner that overrides expensive password hashers during test runs."""

    def setup_test_environment(self, **kwargs):
        super().setup_test_environment(**kwargs)
        self._hasher_override = override_settings(
            PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"]
        )
        self._hasher_override.enable()

    def teardown_test_environment(self, **kwargs):
        self._hasher_override.disable()
        super().teardown_test_environment(**kwargs)
