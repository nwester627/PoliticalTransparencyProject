# Quick Start Guide

## What Changed

### 1. **Better Map Centering** ✅

- Adjusted projection scale from 1000 → 850
- Changed center position to [-10, 20] for better US centering
- Added flex centering to the map container
- Set explicit map dimensions (800x500) for consistent display

### 2. **Live Congress.gov API Integration** ✅

- Created new API service: `src/services/congressApi.js`
- Fetches real-time Senate data for all 50 states
- Displays current senators with their actual party affiliations
- Updates automatically when data changes

## To Test Right Now

### Quick Test (Using DEMO_KEY - Limited)

Just run your dev server:

```bash
npm run dev
```

The map will work with the DEMO_KEY, but you'll be limited to 30 API requests per hour (shared across all users).

### Full Test (Your Own API Key - Recommended)

1. **Get your API key** (takes 1 minute):

   - Go to: https://api.congress.gov/sign-up/
   - Enter your name and email
   - Check your email for the API key

2. **Create `.env.local` file** in the project root:

   ```bash
   NEXT_PUBLIC_CONGRESS_API_KEY=your_api_key_here
   ```

3. **Restart the server**:

   ```bash
   npm run dev
   ```

4. **View the map**:
   - Open http://localhost:3000
   - Scroll down to the Senate map section
   - You should see a loading message, then the map with live data

## What You'll See

- **Loading State**: "Loading Senate data from Congress.gov..."
- **Success State**: Interactive map with current senators
- **Error State**: Message with instructions to get API key

## Benefits of Live Data

1. **Always Up-to-Date**: No manual updates needed when senators change
2. **Accurate**: Official data from Congress.gov
3. **Real-Time**: Reflects current composition including recent appointments
4. **Verified**: Same data source used by government websites

## Technical Details

- **50 API calls on load** (one per state) - completes in ~2-3 seconds
- **5,000 requests/hour limit** with your own API key (plenty for development)
- **Client-side fetching** (runs in the browser)
- **Automatic party detection** handles variations in party names

## Files Modified

1. `src/components/PoliticalMap/PoliticalMap.jsx` - Added API integration and loading states
2. `src/components/PoliticalMap/PoliticalMap.module.css` - Better map centering
3. `src/services/congressApi.js` - NEW: API service layer
4. `.env.local.example` - NEW: Environment variable template
5. `CONGRESS_API_SETUP.md` - NEW: Detailed setup guide

## Next Steps

For production deployment, consider:

- Moving API calls to server-side (faster, no CORS issues)
- Implementing Redis caching (reduce API calls)
- Using ISR (Incremental Static Regeneration) to rebuild every 24 hours
- Adding state-by-state lazy loading for better performance
