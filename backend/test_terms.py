import httpx
import asyncio
import json

async def test():
    async with httpx.AsyncClient() as client:
        result = await client.get(
            'https://api.congress.gov/v3/member/congress/118?currentMember=true&offset=0&limit=5&api_key=jitDGD2o0DOT3Hf4WHGuyfyJREYJiAcPjucgsepD',
            timeout=15.0
        )
        data = result.json()
        
        for member in data['members']:
            name = member.get('name', '')
            terms = member.get('terms', {}).get('item', [])
            print(f"\n{name}:")
            print(f"  Terms: {json.dumps(terms, indent=4)}")
            if terms:
                latest = terms[0]
                print(f"  Latest chamber: {latest.get('chamber')}")
                print(f"  Has end year: {'endYear' in latest}")

asyncio.run(test())
