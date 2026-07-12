
const express = require("express");
const router = express.Router();
const { processImport, getAllLeads } = require("../controllers/importController");

router.post("/process", processImport);
router.get("/leads", getAllLeads); // fetch everything saved so far

module.exports = router;