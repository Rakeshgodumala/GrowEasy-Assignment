
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

const ALLOWED_STATUS = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
const ALLOWED_SOURCE = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

// small helper - pauses execution for a given number of milliseconds
// used to avoid hitting Gemini's free-tier rate limit
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPrompt(batchRows) {
  return `
You are a data mapping engine for a CRM called GrowEasy.

You will receive an array of raw CSV rows (as JSON objects). The column names could be anything —
Facebook Lead Export, Google Ads Export, a real estate CRM export, or a manually made sheet.
Your job is to intelligently map each row to this exact CRM schema:

created_at, name, email, country_code, mobile_without_country_code, company, city, state, country,
lead_owner, crm_status, crm_note, data_source, possession_time, description

Rules you MUST follow:
1. crm_status must be exactly one of: ${ALLOWED_STATUS.join(", ")}. If unclear, leave it "".
2. data_source must be exactly one of: ${ALLOWED_SOURCE.join(", ")}. If none match confidently, leave it "".
3. created_at must be a string parseable by JavaScript's "new Date()" (e.g. "2026-05-13 14:20:48").
4. Put remarks, follow-up notes, extra info that doesn't fit any field into crm_note.
5. If a row has multiple emails, use the first as "email" and append the rest into crm_note.
6. If a row has multiple phone numbers, use the first as "mobile_without_country_code" and append the rest into crm_note.
7. If a row has neither an email nor a mobile number, SKIP it — do not include it in "records", instead put it in "skipped" with a short "reason".
8. Keep every value a plain string (no nested objects/arrays), and never break JSON formatting with raw newlines — escape them as \\n.
9. Do not invent data. If a field is not present in the row, leave it as an empty string "".

Return ONLY valid JSON, no markdown fences, no explanation, in this exact shape:
{
  "records": [ { "created_at": "", "name": "", "email": "", "country_code": "", "mobile_without_country_code": "", "company": "", "city": "", "state": "", "country": "", "lead_owner": "", "crm_status": "", "crm_note": "", "data_source": "", "possession_time": "", "description": "" } ],
  "skipped": [ { "row": {}, "reason": "" } ]
}

Here are the raw rows:
${JSON.stringify(batchRows)}
`;
}

function extractJson(text) {
  // Gemini sometimes wraps JSON in ```json ... ``` even when told not to — strip it safely
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

// sends one batch of rows to Gemini, retries with increasing delay if it fails
async function extractBatch(batchRows, retries = 3) {
  const prompt = buildPrompt(batchRows);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = extractJson(text);

      parsed.records = (parsed.records || []).map((r) => ({
        ...r,
        crm_status: ALLOWED_STATUS.includes(r.crm_status) ? r.crm_status : "",
        data_source: ALLOWED_SOURCE.includes(r.data_source) ? r.data_source : "",
      }));

      return {
        records: parsed.records || [],
        skipped: parsed.skipped || [],
      };
    } catch (err) {
      console.error(`Batch attempt ${attempt + 1} failed:`, err.message);

      if (attempt === retries) {
        // give up on this batch after all retries - mark rows as skipped instead of crashing
        return {
          records: [],
          skipped: batchRows.map((row) => ({ row, reason: "AI extraction failed" })),
        };
      }

      // wait longer each retry so the rate limit has time to reset
      // attempt 0 fails -> wait 2s, attempt 1 fails -> wait 4s, attempt 2 fails -> wait 6s
      await wait(2000 * (attempt + 1));
    }
  }
}

// splits all rows into batches and processes them one at a time
async function extractAll(rows, batchSize = 25) {
  const batches = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push(rows.slice(i, i + batchSize));
  }

  const allRecords = [];
  const allSkipped = [];

  for (const batch of batches) {
    const { records, skipped } = await extractBatch(batch);
    allRecords.push(...records);
    allSkipped.push(...skipped);

    // pause briefly between batches too, not just retries -
    // this is the main fix for free-tier rate limiting
    await wait(1500);
  }

  return { records: allRecords, skipped: allSkipped };
}

module.exports = { extractAll };





