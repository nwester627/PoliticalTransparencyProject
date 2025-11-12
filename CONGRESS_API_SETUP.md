# Congress.gov API Integration

## Setup Instructions

### 1. Get Your API Key

1. Visit [https://api.congress.gov/sign-up/](https://api.congress.gov/sign-up/)
2. Fill out the registration form with your name and email
3. You'll receive your API key via email instantly (it's free!)

### 2. Configure Your Environment

1. Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your API key:

   ```
   NEXT_PUBLIC_CONGRESS_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Features

The Senate map now displays **real-time data** from Congress.gov, including:

- ✅ Current senators for all 50 states
- ✅ Party affiliations (Republican, Democrat, Independent)
- ✅ State control visualization (Red/Blue/Purple)
- ✅ Live Senate breakdown counts
- ✅ Automatic updates when you refresh the page

## API Details

- **Base URL**: `https://api.congress.gov/v3`
- **Endpoint Used**: `/member/{stateCode}?currentMember=true`
- **Rate Limit**: 5,000 requests per hour
- **Format**: JSON
- **Cost**: Free

## How It Works

1. **On Load**: The component fetches current members for all 50 states
2. **Filtering**: Only senators with active terms are included
3. **Party Detection**: Automatically normalizes party names
4. **Control Calculation**: Determines if state has both R, both D, or split delegation
5. **Caching**: Data is fetched once per page load (no constant API calls)

## Fallback Behavior

If the API key is missing or invalid, the map will display an error message with instructions to sign up for a free API key.

## Development Notes

- The `DEMO_KEY` fallback has very limited rate limits (30 requests per hour per IP)
- For development, **always use your own API key**
- The API key is safe to expose in the frontend (it's prefixed with `NEXT_PUBLIC_`)
- Data is fetched client-side in the browser

## Troubleshooting

### "Failed to load Senate data"

1. Check that your `.env.local` file exists and contains your API key
2. Verify the API key is correct (no extra spaces or quotes)
3. Restart your development server after adding the API key
4. Check browser console for detailed error messages

### Slow Loading

- The initial load fetches data for all 50 states (50 API calls)
- This is a one-time cost per page load
- Consider implementing caching or server-side fetching for production

### Rate Limit Errors

- With your API key: 5,000 requests/hour (plenty for development)
- Without API key (DEMO_KEY): Only 30 requests/hour shared across all IPs
- Solution: Use your own API key

## Future Improvements

- [ ] Server-side data fetching (faster initial load)
- [ ] Redis caching (reduce API calls)
- [ ] Incremental static regeneration (ISR) every 24 hours
- [ ] More detailed senator information (committee memberships, contact info)
- [ ] Historical data comparison
