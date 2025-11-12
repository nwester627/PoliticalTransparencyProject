# Political Transparency API Backend

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. (Optional) Configure Environment

```bash
cp .env.example .env
```

The default configuration works out of the box! No API keys required.

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 5. Test the API

Visit `http://localhost:8000/docs` for interactive API documentation

## API Endpoints

- `GET /api/house` - Get House of Representatives data
- `GET /api/senate` - Get Senate data
- `GET /api/white-house` - Get President and Vice President info
- `GET /api/state/{state_abbr}` - Get state details with districts and representatives

## Notes

- The backend must be running for the Congressional Map to display real data
- Make sure CORS is configured for your Next.js frontend URL
- Data is fetched from the official **Congress.gov API** (Library of Congress)
- **No API key required!** The Congress.gov API is free and open to use
