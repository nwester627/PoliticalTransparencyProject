from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv

from .models import Member, ChamberBreakdown, WhiteHouse, StateDetail
from .services import congress_service
# Civic election service removed — election result tracking discontinued
import httpx
from fastapi import Query
import time
from pathlib import Path
import json

# Simple in-memory cache for proxied responses
PROXY_CACHE = {}
PROXY_TTL = int(os.getenv("PROXY_TTL_SECONDS", "60"))

load_dotenv()

app = FastAPI(
    title="Political Transparency API",
    description="API for congressional data and political information",
    version="1.0.0"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Political Transparency API",
        "version": "1.0.0",
        "endpoints": {
            "house": "/api/house",
            "senate": "/api/senate",
            "white_house": "/api/white-house",
            "state_details": "/api/state/{state_abbr}"
        }
    }


@app.get("/api/house", response_model=dict)
async def get_house_data():
    """Get House of Representatives members and breakdown"""
    try:
        members, breakdown = await congress_service.get_house_members()
        return {
            "members": [m.model_dump() for m in members],
            "breakdown": breakdown.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching House data: {str(e)}")


@app.get("/api/senate", response_model=dict)
async def get_senate_data():
    """Get Senate members and breakdown"""
    try:
        members, breakdown = await congress_service.get_senate_members()
        return {
            "members": [m.model_dump() for m in members],
            "breakdown": breakdown.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Senate data: {str(e)}")


@app.get("/api/white-house", response_model=WhiteHouse)
async def get_white_house_data():
    """Get current President and Vice President information"""
    try:
        return await congress_service.get_white_house()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching White House data: {str(e)}")


@app.get("/api/state/{state_abbr}", response_model=StateDetail)
async def get_state_details(state_abbr: str):
    """Get detailed information for a specific state including districts and senators"""
    try:
        if len(state_abbr) != 2:
            raise HTTPException(status_code=400, detail="State abbreviation must be 2 characters")
        
        return await congress_service.get_state_details(state_abbr)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching state data: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}




# --- Proxy endpoints for external APIs (Congress.gov, FEC) ---
CONGRESS_API_KEY = os.getenv("CONGRESS_API_KEY")
FEC_API_KEY = os.getenv("FEC_API_KEY")


@app.get("/api/proxy/congress/member/{member_id}")
async def proxy_congress_member(member_id: str):
    """Proxy a single member lookup to Congress.gov"""
    try:
        if not CONGRESS_API_KEY:
            raise HTTPException(status_code=500, detail="CONGRESS_API_KEY not configured on server")

        url = f"https://api.congress.gov/v3/member/{member_id}?api_key={CONGRESS_API_KEY}"
        # cache key
        cache_key = f"congress:member:{member_id}"
        cached = PROXY_CACHE.get(cache_key)
        if cached and time.time() - cached[0] < PROXY_TTL:
            return cached[1]

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            PROXY_CACHE[cache_key] = (time.time(), data)
            return data
    except httpx.HTTPStatusError as he:
        raise HTTPException(status_code=he.response.status_code, detail=str(he))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error proxying Congress member: {str(e)}")


@app.get("/api/proxy/fec/candidates/search")
async def proxy_fec_candidate_search(q: str = Query(...), per_page: int = 1):
    """Proxy candidate search to the FEC API"""
    try:
        if not FEC_API_KEY:
            raise HTTPException(status_code=500, detail="FEC_API_KEY not configured on server")

        url = (
            f"https://api.open.fec.gov/v1/candidates/search/?q={httpx.utils.quote(q)}&api_key={FEC_API_KEY}&per_page={per_page}"
        )
        cache_key = f"fec:search:{q}:{per_page}"
        cached = PROXY_CACHE.get(cache_key)
        if cached and time.time() - cached[0] < PROXY_TTL:
            return cached[1]

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            PROXY_CACHE[cache_key] = (time.time(), data)
            return data
    except httpx.HTTPStatusError as he:
        raise HTTPException(status_code=he.response.status_code, detail=str(he))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error proxying FEC candidate search: {str(e)}")


@app.get("/api/proxy/fec/candidate/{candidate_id}/totals")
async def proxy_fec_candidate_totals(candidate_id: str):
    try:
        if not FEC_API_KEY:
            raise HTTPException(status_code=500, detail="FEC_API_KEY not configured on server")

        url = f"https://api.open.fec.gov/v1/candidate/{candidate_id}/totals/?api_key={FEC_API_KEY}&election_full=true"
        cache_key = f"fec:totals:{candidate_id}"
        cached = PROXY_CACHE.get(cache_key)
        if cached and time.time() - cached[0] < PROXY_TTL:
            return cached[1]

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            PROXY_CACHE[cache_key] = (time.time(), data)
            return data
    except httpx.HTTPStatusError as he:
        raise HTTPException(status_code=he.response.status_code, detail=str(he))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error proxying FEC candidate totals: {str(e)}")


@app.get("/api/proxy/fec/candidate/{candidate_id}/committees")
async def proxy_fec_candidate_committees(candidate_id: str):
    try:
        if not FEC_API_KEY:
            raise HTTPException(status_code=500, detail="FEC_API_KEY not configured on server")

        url = f"https://api.open.fec.gov/v1/candidate/{candidate_id}/committees/?api_key={FEC_API_KEY}"
        cache_key = f"fec:committees:{candidate_id}"
        cached = PROXY_CACHE.get(cache_key)
        if cached and time.time() - cached[0] < PROXY_TTL:
            return cached[1]

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            PROXY_CACHE[cache_key] = (time.time(), data)
            return data
    except httpx.HTTPStatusError as he:
        raise HTTPException(status_code=he.response.status_code, detail=str(he))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error proxying FEC candidate committees: {str(e)}")


@app.get("/api/proxy/fec/committee/{committee_id}/schedule_a")
async def proxy_fec_committee_schedule_a(committee_id: str, per_page: int = 10, two_year_transaction_period: int = None):
    try:
        if not FEC_API_KEY:
            raise HTTPException(status_code=500, detail="FEC_API_KEY not configured on server")

        params = f"?committee_id={committee_id}&sort=-contribution_receipt_amount&per_page={per_page}&contributor_type=individual&api_key={FEC_API_KEY}"
        if two_year_transaction_period:
            params = f"?committee_id={committee_id}&sort=-contribution_receipt_amount&per_page={per_page}&two_year_transaction_period={two_year_transaction_period}&contributor_type=individual&api_key={FEC_API_KEY}"

        url = f"https://api.open.fec.gov/v1/schedules/schedule_a/{params}"
        cache_key = f"fec:schedule_a:{committee_id}:{per_page}:{two_year_transaction_period}"
        cached = PROXY_CACHE.get(cache_key)
        if cached and time.time() - cached[0] < PROXY_TTL:
            return cached[1]

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            PROXY_CACHE[cache_key] = (time.time(), data)
            return data
    except httpx.HTTPStatusError as he:
        raise HTTPException(status_code=he.response.status_code, detail=str(he))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error proxying FEC schedule_a: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run("main:app", host=host, port=port, reload=True)
