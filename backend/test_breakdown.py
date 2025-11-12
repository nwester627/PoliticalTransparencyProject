import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        # Test House
        result = await client.get('http://localhost:8000/api/house', timeout=30)
        data = result.json()
        print(f'=== HOUSE ===')
        print(f'Total House members: {len(data["members"])}')
        print(f'Breakdown: {data["breakdown"]}')
        print()
        
        # Test Senate
        result = await client.get('http://localhost:8000/api/senate', timeout=30)
        data = result.json()
        print(f'=== SENATE ===')
        print(f'Total Senate members: {len(data["members"])}')
        print(f'Breakdown: {data["breakdown"]}')
        print()
        
        # Show some sample members to check the data
        print(f'Sample House member: {data["members"][0] if data["members"] else "None"}')

asyncio.run(test())
