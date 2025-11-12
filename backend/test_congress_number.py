import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        # Test 119th Congress
        result = await client.get(
            'https://api.congress.gov/v3/member/congress/119?currentMember=true&offset=0&limit=250&api_key=jitDGD2o0DOT3Hf4WHGuyfyJREYJiAcPjucgsepD',
            timeout=15.0
        )
        print(f"119th Congress status: {result.status_code}")
        if result.status_code == 200:
            data = result.json()
            print(f"119th Congress count: {data.get('pagination', {}).get('count', 0)}")
        
        # Test 118th Congress
        result = await client.get(
            'https://api.congress.gov/v3/member/congress/118?currentMember=true&offset=0&limit=250&api_key=jitDGD2o0DOT3Hf4WHGuyfyJREYJiAcPjucgsepD',
            timeout=15.0
        )
        print(f"118th Congress status: {result.status_code}")
        if result.status_code == 200:
            data = result.json()
            print(f"118th Congress count: {data.get('pagination', {}).get('count', 0)}")

asyncio.run(test())
