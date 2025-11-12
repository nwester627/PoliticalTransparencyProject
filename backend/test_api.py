import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        result = await client.get('http://localhost:8000/api/house', timeout=30)
        data = result.json()
        print(f'Total House members: {len(data["members"])}')
        print(f'Breakdown: {data["breakdown"]}')

asyncio.run(test())
