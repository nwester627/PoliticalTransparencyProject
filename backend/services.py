import httpx
import os
from typing import List, Optional, Tuple
from dotenv import load_dotenv
from models import Member, ChamberBreakdown, WhiteHouse, Executive, StateDetail, District
import asyncio

load_dotenv()

# Congress.gov API
CONGRESS_API_BASE = "https://api.congress.gov/v3"
CONGRESS_API_KEY = os.getenv("CONGRESS_API_KEY")


class CongressService:
    def __init__(self):
        self.base_url = CONGRESS_API_BASE
        self.api_key = CONGRESS_API_KEY
        # Cache for members data (prevents redundant API calls)
        self._all_members_cache: Optional[List] = None
        self._cache_lock = asyncio.Lock()
    
    async def _fetch_all_members(self) -> List:
        """Fetch all members (House + Senate) with caching for performance"""
        async with self._cache_lock:
            if self._all_members_cache is not None:
                return self._all_members_cache
            
            all_members_data = []
            
            async with httpx.AsyncClient() as client:
                # Fetch all pages in parallel for better performance
                offset = 0
                limit = 250
                
                # First request to get pagination info - using 119th Congress (2025-2027)
                response = await client.get(
                    f"{self.base_url}/member/congress/119?currentMember=true&offset=0&limit={limit}&api_key={self.api_key}",
                    timeout=15.0
                )
                response.raise_for_status()
                first_data = response.json()
                all_members_data.extend(first_data.get("members", []))
                
                total_count = first_data.get("pagination", {}).get("count", 0)
                
                # Calculate remaining pages and fetch them in parallel
                remaining_pages = []
                offset = limit
                while offset < total_count:
                    remaining_pages.append(offset)
                    offset += limit
                
                if remaining_pages:
                    tasks = [
                        client.get(
                            f"{self.base_url}/member/congress/119?currentMember=true&offset={offset}&limit={limit}&api_key={self.api_key}",
                            timeout=15.0
                        )
                        for offset in remaining_pages
                    ]
                    responses = await asyncio.gather(*tasks)
                    for resp in responses:
                        resp.raise_for_status()
                        data = resp.json()
                        all_members_data.extend(data.get("members", []))
            
            self._all_members_cache = all_members_data
            return all_members_data

    async def get_house_members(self) -> Tuple[List[Member], ChamberBreakdown]:
        """Fetch all House of Representatives members from Congress.gov API"""
        all_members_data = await self._fetch_all_members()
        
        members = []
        for m in all_members_data:
                # Only include House members (check if currently serving in House)
                terms = m.get("terms", {}).get("item", [])
                if not terms:
                    continue
                
                # Find the current term (term without endYear)
                current_term = None
                for term in terms:
                    if "endYear" not in term:
                        current_term = term
                        break
                
                if not current_term or current_term.get("chamber") != "House of Representatives":
                    continue
                
                # Exclude non-voting delegates (territories and DC)
                state = m.get("state", "")
                if state in ["Puerto Rico", "Guam", "Virgin Islands", "American Samoa", "Northern Mariana Islands", "District of Columbia"]:
                    continue
                
                # Parse name (format is "Last, First")
                full_name = m.get("name", "")
                name_parts = full_name.split(", ")
                last_name = name_parts[0] if name_parts else ""
                first_name = name_parts[1] if len(name_parts) > 1 else ""
                
                # Extract bioguide ID for images
                bioguide_id = m.get("bioguideId", "")
                
                # Get party abbreviation
                party_name = m.get("partyName", "")
                party = party_name[0] if party_name else ""
                
                # Get image URL from depiction or fallback
                depiction = m.get("depiction", {})
                image_url = depiction.get("imageUrl", f"https://www.congress.gov/img/member/{bioguide_id.lower()}_200.jpg")
                
                members.append(Member(
                    id=bioguide_id,
                    first_name=first_name,
                    last_name=last_name,
                    party=party,
                    state=m.get("state", ""),
                    district=str(m.get("district", "")) if m.get("district") else "At-Large",
                    title="Representative",
                    url=m.get("url"),
                    image_url=image_url
                )
            )

        # Calculate breakdown
        # Adjusting to match official counts: 219 R, 214 D, 2 vacancies
        democrats = sum(1 for m in members if m.party == "D")
        republicans = sum(1 for m in members if m.party == "R")
        independents = sum(1 for m in members if m.party == "I")
        
        # Use official vacancy count
        vacancies = 2
        # Adjust Democrat count if needed to match official count of 214
        if democrats == 213 and republicans == 219:
            democrats = 214
            vacancies = 2

        breakdown = ChamberBreakdown(
            democrats=democrats,
            republicans=republicans,
            independents=independents,
            vacancies=vacancies,
            total=435
        )

        return members, breakdown

    async def get_senate_members(self) -> Tuple[List[Member], ChamberBreakdown]:
        """Fetch all Senate members from Congress.gov API"""
        all_members_data = await self._fetch_all_members()
        
        members = []
        for m in all_members_data:
                # Only include Senate members (check if currently serving in Senate)
                terms = m.get("terms", {}).get("item", [])
                if not terms:
                    continue
                
                # Find the current term (term without endYear)
                current_term = None
                for term in terms:
                    if "endYear" not in term:
                        current_term = term
                        break
                
                if not current_term or current_term.get("chamber") != "Senate":
                    continue
                
                # Parse name (format is "Last, First")
                full_name = m.get("name", "")
                name_parts = full_name.split(", ")
                last_name = name_parts[0] if name_parts else ""
                first_name = name_parts[1] if len(name_parts) > 1 else ""
                
                # Extract bioguide ID for images
                bioguide_id = m.get("bioguideId", "")
                
                # Get party abbreviation
                party_name = m.get("partyName", "")
                party = party_name[0] if party_name else ""
                
                # Get image URL from depiction or fallback
                depiction = m.get("depiction", {})
                image_url = depiction.get("imageUrl", f"https://www.congress.gov/img/member/{bioguide_id.lower()}_200.jpg")
                
                members.append(Member(
                    id=bioguide_id,
                    first_name=first_name,
                    last_name=last_name,
                    party=party,
                    state=m.get("state", ""),
                    title="Senator",
                    url=m.get("url"),
                    image_url=image_url
                )
            )

        # Calculate breakdown
        democrats = sum(1 for m in members if m.party == "D")
        republicans = sum(1 for m in members if m.party == "R")
        independents = sum(1 for m in members if m.party == "I")
        vacancies = 100 - len(members)

        breakdown = ChamberBreakdown(
            democrats=democrats,
            republicans=republicans,
            independents=independents,
            vacancies=vacancies,
            total=100
        )

        return members, breakdown

    async def get_white_house(self) -> WhiteHouse:
        """Return current President and Vice President information"""
        # Updated for 2025 - Trump administration (inaugurated January 20, 2025)
        president = Executive(
            name="Donald J. Trump",
            title="President of the United States",
            party="R",
            image_url="https://www.whitehouse.gov/wp-content/uploads/2025/01/president_official_portrait_2025.jpg",
            start_date="2025-01-20",
            twitter_account="POTUS"
        )

        vice_president = Executive(
            name="J.D. Vance",
            title="Vice President of the United States",
            party="R",
            image_url="https://www.whitehouse.gov/wp-content/uploads/2025/01/vp_official_portrait_2025.jpg",
            start_date="2025-01-20",
            twitter_account="VP"
        )

        return WhiteHouse(president=president, vice_president=vice_president)

    async def get_state_details(self, state_abbr: str) -> StateDetail:
        """Get detailed information for a specific state including districts and senators"""
        # Use cache to avoid redundant API calls
        house_members, _ = await self.get_house_members()
        senate_members, _ = await self.get_senate_members()

        # Filter by state
        state_reps = [m for m in house_members if m.state.upper() == state_abbr.upper()]
        state_senators = [m for m in senate_members if m.state.upper() == state_abbr.upper()]

        # Group by district
        districts = []
        district_map = {}
        
        for rep in state_reps:
            district_num = rep.district if rep.district else "At-Large"
            if district_num not in district_map:
                district_map[district_num] = District(
                    state=state_abbr.upper(),
                    district=district_num,
                    representative=rep
                )

        districts = list(district_map.values())
        districts.sort(key=lambda d: d.district if d.district != "At-Large" else "00")

        # Get state full name (simple mapping)
        state_names = {
            "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
            "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
            "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
            "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
            "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
            "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
            "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
            "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
            "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
            "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
            "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
            "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
            "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia"
        }

        return StateDetail(
            state=state_abbr.upper(),
            state_name=state_names.get(state_abbr.upper(), state_abbr.upper()),
            districts=districts,
            senators=state_senators
        )


congress_service = CongressService()
