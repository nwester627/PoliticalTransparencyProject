import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        result = await client.get('http://localhost:8000/api/house', timeout=30)
        data = result.json()
        
        # Group by state to find territories
        by_state = {}
        for member in data['members']:
            state = member['state']
            by_state[state] = by_state.get(state, 0) + 1
        
        # Check for territories (non-voting delegates)
        territories = ['Puerto Rico', 'Guam', 'Virgin Islands', 'American Samoa', 'Northern Mariana Islands', 'District of Columbia']
        
        print("Potential non-voting delegates:")
        for territory in territories:
            if territory in by_state:
                print(f"  {territory}: {by_state[territory]}")
        
        # Show states with unexpected counts
        print("\nAll states:")
        for state, count in sorted(by_state.items()):
            if state in ['PR', 'GU', 'VI', 'AS', 'MP', 'DC']:
                print(f"  {state}: {count} (TERRITORY/DC)")

asyncio.run(test())
