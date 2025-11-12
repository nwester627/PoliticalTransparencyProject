from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class Party(str, Enum):
    DEMOCRAT = "D"
    REPUBLICAN = "R"
    INDEPENDENT = "I"


class Member(BaseModel):
    id: str
    first_name: str
    last_name: str
    party: str
    state: str
    district: Optional[str] = None
    title: str
    twitter_account: Optional[str] = None
    facebook_account: Optional[str] = None
    youtube_account: Optional[str] = None
    url: Optional[str] = None
    office: Optional[str] = None
    phone: Optional[str] = None
    next_election: Optional[str] = None
    image_url: Optional[str] = None


class District(BaseModel):
    state: str
    district: str
    representative: Optional[Member] = None


class ChamberBreakdown(BaseModel):
    democrats: int
    republicans: int
    independents: int
    vacancies: int
    total: int


class Executive(BaseModel):
    name: str
    title: str
    party: str
    image_url: str
    start_date: str
    twitter_account: Optional[str] = None


class WhiteHouse(BaseModel):
    president: Executive
    vice_president: Executive


class StateDetail(BaseModel):
    state: str
    state_name: str
    districts: List[District]
    senators: List[Member]
