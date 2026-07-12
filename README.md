# GrowEasy CSV Importer

An AI-powered CSV importer that intelligently maps any CSV format (Facebook Lead Export, Google Ads Export, real estate CRM exports, manually created spreadsheets, etc.) into GrowEasy's fixed CRM lead schema — without relying on fixed column-name rules.

## Live Links

- **Hosted App:** https://grow-easy-assignment-rosy.vercel.app/
- **Backend API:** https://groweasy-assignment-qwnj.onrender.com/
**- **GitHub Repo:** https://github.com/Rakeshgodumala/GrowEasy-Assignment

## Tech Stack

- **Frontend:** React.js (Create React App), Bootstrap 5, Bootstrap Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas in production, Compass locally)
- **AI:** Google Gemini API (`gemini-3.1-flash-lite`)
- **CSV Parsing:** PapaParse

## How It Works

1. **Upload** — user uploads a CSV via drag-and-drop or file picker
2. **Preview** — the CSV is parsed on the frontend only, and shown in a responsive, scrollable table (no AI call yet)
3. **Confirm** — user reviews the data and clicks Confirm Import, which is the only action that triggers the backend
4. **AI Extraction** — the backend batches rows (25 per batch) and sends each batch to Gemini with a structured prompt that maps arbitrary column names to GrowEasy's CRM fields, following strict rules (allowed status values, allowed source values, multiple email/phone handling, skip logic for rows with no email/phone)
5. **Result** — the backend saves valid records to MongoDB and returns imported/skipped records as JSON, which the frontend displays in a tabbed results table with totals

## Project Structure

```
GrowEasy/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/Lead.js            # Mongoose schema for a CRM lead
│   ├── services/aiService.js     # Gemini prompt + batching + retry logic
│   ├── controllers/importController.js  # Request handling, save to DB
│   ├── routes/importRoutes.js    # API route definitions
│   ├── server.js                 # Express app entry point
│   └── .env                      # Environment variables (not committed)
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── FileUpload.js     # Step 1: drag & drop / file picker
    │   │   ├── PreviewTable.js   # Step 2 & 3: preview + confirm
    │   │   ├── ResultTable.js    # Step 4: imported/skipped results
    │   │   └── Loader.js         # Loading state during AI processing
    │   ├── App.js                # Main screen flow controller
    │   └── App.css                # Custom styling
```

## CRM Fields Extracted

`created_at`, `name`, `email`, `country_code`, `mobile_without_country_code`, `company`, `city`, `state`, `country`, `lead_owner`, `crm_status`, `crm_note`, `data_source`, `possession_time`, `description`

## AI Rules Implemented

- `crm_status` restricted to: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`
- `data_source` restricted to: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots` (left blank if no confident match)
- `created_at` always returned in a format valid for JavaScript's `new Date()`
- Extra remarks, notes, additional emails/phones routed into `crm_note`
- First email/phone used as primary; extras appended to `crm_note`
- Rows with **no email AND no phone** are skipped, with a stated reason

## Local Setup

### Prerequisites
- Node.js installed
- MongoDB running locally (or a MongoDB Atlas connection string)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/groweasy
GEMINI_API_KEY=your_gemini_api_key_here
```
Run the backend:
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```
The app opens at `http://localhost:3000`.

## Batch Processing & Reliability

- Rows are processed in batches of 25 to avoid oversized AI requests
- Each batch retries up to 3 times with increasing delay (2s, 4s, 6s) if the AI call fails, to handle transient rate limits or network errors gracefully
- A short delay is added between batches to stay within free-tier API rate limits
- Batches that fail after all retries are marked as skipped with a clear reason, rather than crashing the import

## Known Limitations

- Uses Gemini's free tier, which has daily/per-minute request quotas — very large CSVs processed in quick succession may occasionally hit rate limits
- No authentication layer (out of scope for this assignment)

## Author

Rakesh Godumal — submitted for Software Developer Intern position

