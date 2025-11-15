import os
from typing import Any, Dict, List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CIVIC_BASE = "https://www.googleapis.com/civicinfo/v2"
GOOGLE_CIVIC_KEY = os.getenv("GOOGLE_CIVIC_API_KEY")


class CivicService:
    def __init__(self):
        self.base = GOOGLE_CIVIC_BASE
        self.api_key = GOOGLE_CIVIC_KEY

    async def get_election_dashboard(self, address: Optional[str] = None) -> Dict[str, Any]:
        """Fetch elections and construct the dashboard payload (dates + voterInfo).
        This mirrors the previous client-side logic but runs server-side to keep the key private.
        """
        # Fallback mock data
        mock = {
            "dates": [
                {
                    "date": "November 5, 2024",
                    "event": "Presidential General Election",
                    "type": "general",
                    "status": "completed",
                    "resultsUrl": "/elections/2024-presidential",
                }
            ],
            "voterInfo": {
                "state": "Your State",
                "registrationDeadline": "October 5, 2024",
                "votingMethods": ["In Person", "Mail", "Early Voting"],
                "requirements": ["Valid ID", "Registered to Vote", "Citizen"],
            },
        }

        if not self.api_key:
            return mock

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                elections_resp = await client.get(f"{self.base}/elections", params={"key": self.api_key})
                elections_resp.raise_for_status()
                elections_json = elections_resp.json()
                all_elections = elections_json.get("elections", [])

                from datetime import datetime, timedelta

                today = datetime.utcnow().date()
                three_months = today + timedelta(days=90)

                upcoming = [e for e in all_elections if e.get("electionDay") and today <= datetime.fromisoformat(e.get("electionDay")).date() <= three_months]
                past = [e for e in all_elections if e.get("electionDay") and datetime.fromisoformat(e.get("electionDay")).date() < today]
                past.sort(key=lambda e: e.get("electionDay"), reverse=True)

                selected = upcoming[:4] if upcoming else past[:4]

                dates: List[Dict[str, Any]] = []
                for e in selected:
                    try:
                        d = datetime.fromisoformat(e.get("electionDay")).date()
                        is_upcoming = today <= d <= three_months
                        dates.append({
                            "date": d.strftime("%B %d, %Y"),
                            "event": e.get("name", "Election"),
                            "type": "general",
                            "status": "upcoming" if is_upcoming else "completed",
                            "resultsUrl": f"/elections/{e.get('id')}",
                            "state": e.get("ocdDivisionId", "National"),
                        })
                    except Exception:
                        continue

                voter_info = mock["voterInfo"]
                if upcoming:
                    # try to fetch voterinfo for the nearest upcoming election
                    try:
                        eid = upcoming[0].get("id")
                        vi_resp = await client.get(f"{self.base}/voterinfo", params={"key": self.api_key, "address": address or "New York, NY", "electionId": eid})
                        vi_resp.raise_for_status()
                        vi = vi_resp.json()
                        voter_info = {
                            "state": vi.get("normalizedInput", {}).get("state", "Your State"),
                            "registrationDeadline": "TBD",
                            "votingMethods": vi.get("state", [{}])[0].get("electionAdministrationBody", {}).get("votingMethods", ["In Person", "Mail"]),
                            "requirements": ["Valid ID", "Registered to Vote", "Citizen"],
                        }
                    except Exception:
                        # keep mock voter info
                        pass

                return {"dates": dates if dates else mock["dates"], "voterInfo": voter_info}

            except Exception:
                return mock


civic_service = CivicService()
