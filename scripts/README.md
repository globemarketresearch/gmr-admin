# Scripts

This directory contains utility scripts for the Healthcare Market Research Admin application.

## Available Scripts

### seed-reports.js

Generates and inserts 50 sample healthcare market research reports into the database via the API.

#### Prerequisites

1. Ensure the backend API server is running
2. You have a valid authentication token

#### Getting an Authentication Token

First, you need to authenticate and get an access token:

1. **Option 1: Login via API**
   ```bash
   # Login to get your token
   curl -X POST http://localhost:8081/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your-email@example.com",
       "password": "your-password"
     }'
   ```

   This will return a response with an `access_token` field. Copy that token.

2. **Option 2: Extract from browser**
   - Login to the admin panel in your browser
   - Open browser DevTools (F12)
   - Go to Application/Storage → Local Storage
   - Look for the key `admin_auth_token`
   - Copy the token value

#### Usage

```bash
# Basic usage with inline token
AUTH_TOKEN=your-token-here node scripts/seed-reports.js

# Or set it as an environment variable first
export AUTH_TOKEN=your-token-here
node scripts/seed-reports.js

# Using npm script (recommended)
npm run seed:reports
```

#### Configuration

The script uses the following environment variables:

- `NEXT_PUBLIC_API_BASE_URL` - API base URL (default: http://localhost:8081/api)
- `AUTH_TOKEN` - **Required** - Authentication token for API requests

#### What the Script Does

The script will:

1. Fetch available categories from the API
2. Generate 50 diverse healthcare market research reports with:
   - Varied market segments (Pharmaceuticals, Medical Devices, Healthcare IT, etc.)
   - Different geographies (North America, Europe, Asia Pacific, etc.)
   - Random but realistic market metrics (revenue, CAGR, forecasts)
   - Complete report sections (Executive Summary, Market Overview, etc.)
   - Key players with market share data
   - FAQs and metadata
   - Table of contents structure
3. Create each report via POST request to the API
4. Display progress and results

#### Sample Output

```
🚀 Starting report seeding process...
📡 API URL: http://localhost:8081/api

📋 Fetching categories...
✅ Found 5 categories

📝 Creating 50 sample reports...

✅ [1/50] Created: Pharmaceuticals Market Analysis 2026 - 2031...
✅ [2/50] Created: Medical Devices Market Analysis 2026 - 2031...
✅ [3/50] Created: Healthcare IT Market Analysis 2026 - 2031...
...

════════════════════════════════════════════════════════════════════════════════
📊 SUMMARY
════════════════════════════════════════════════════════════════════════════════
✅ Successfully created: 50 reports
❌ Failed: 0 reports
════════════════════════════════════════════════════════════════════════════════

🎉 All reports created successfully!
```

#### Troubleshooting

**Error: AUTH_TOKEN environment variable is required**
- Make sure you've set the AUTH_TOKEN environment variable
- See "Getting an Authentication Token" section above

**Error: Failed to fetch categories**
- Ensure the backend API server is running
- Check that `NEXT_PUBLIC_API_BASE_URL` is correctly set
- Verify network connectivity

**Error: 401 Unauthorized**
- Your authentication token may have expired
- Get a new token following the steps in "Getting an Authentication Token"

**Error: 400 Bad Request / Validation errors**
- The backend validation rules may have changed
- Check the backend API documentation for updated requirements
- Ensure category IDs exist in the database

#### Notes

- Each report is created with a small delay (100ms) to avoid overwhelming the server
- Reports are distributed across available categories
- Both 'draft' and 'published' status reports are created (80% published, 20% draft)
- 30% of reports are marked as featured
- All required sections are populated with realistic content
- Market metrics include current revenue, forecast revenue, and CAGR calculations
