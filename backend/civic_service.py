"""
civic_service module removed.

This project no longer tracks election results. The previous implementation
that proxied the Google Civic API has been intentionally removed to simplify
the codebase. Keeping this stub file prevents import errors if any references
remain; do not use this module.
"""

from typing import Any, Dict, Optional


def _removed_stub(*args, **kwargs) -> Dict[str, Any]:
    return {"error": "election tracking removed"}


class CivicServiceStub:
    def get_election_dashboard(self, address: Optional[str] = None) -> Dict[str, Any]:
        return _removed_stub()

    def get_election_details(self, election_id: str, address: Optional[str] = None) -> Dict[str, Any]:
        return _removed_stub()


civic_service = CivicServiceStub()
