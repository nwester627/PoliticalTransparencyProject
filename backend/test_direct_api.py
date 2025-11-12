import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        result = await client.get(
            'https://api.congress.gov/v3/member/congress/118?currentMember=true&offset=0&limit=464&api_key=jitDGD2o0DOT3Hf4WHGuyfyJREYJiAcPjucgsepD',
            timeout=15.0
        )
        data = result.json()
        
        house_count = 0
        senate_count = 0
        
        for member in data['members']:
            terms = member.get('terms', {}).get('item', [])
            current_term = None
            for term in terms:
                if "endYear" not in term:
                    current_term = term
                    break
            
            if current_term:
                chamber = current_term.get('chamber')
                if chamber == 'House of Representatives':
                    house_count += 1
                elif chamber == 'Senate':
                    senate_count += 1
        
        print(f'House members with current term: {house_count}')
        print(f'Senate members with current term: {senate_count}')
        print(f'Total: {house_count + senate_count}')

asyncio.run(test())
