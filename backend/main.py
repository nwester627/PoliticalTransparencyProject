from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv

from models import Member, ChamberBreakdown, WhiteHouse, StateDetail
from services import congress_service

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


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run("main:app", host=host, port=port, reload=True)
