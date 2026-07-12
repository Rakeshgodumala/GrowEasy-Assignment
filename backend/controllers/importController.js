

const Lead = require("../models/Lead");
const { extractAll } = require("../services/aiService");

// handles the main CSV import flow:
// receives raw rows from frontend -> sends to AI for mapping -> saves clean leads to MongoDB
const processImport = async (req, res) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "No rows provided" });
    }

    const { records, skipped } = await extractAll(rows);

    // save to MongoDB so leads persist across page reloads / future uploads
    if (records.length > 0) {
      await Lead.insertMany(records);
    }

    res.json({
      totalImported: records.length,
      totalSkipped: skipped.length,
      records,
      skipped,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Import failed", error: err.message });
  }
};

// fetches every lead ever saved to MongoDB, newest first
// this powers the "Manage Leads" screen so past imports don't disappear
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({ leads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leads", error: err.message });
  }
};

module.exports = { processImport, getAllLeads };