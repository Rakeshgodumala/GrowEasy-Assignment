const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    created_at: { type: String },
    name: { type: String },
    email: { type: String },
    country_code: { type: String },
    mobile_without_country_code: { type: String },
    company: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    lead_owner: { type: String },
    crm_status: {
      type: String,
      enum: ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE", ""],
    },
    crm_note: { type: String },
    data_source: {
      type: String,
      enum: [
        "leads_on_demand",
        "meridian_tower",
        "eden_park",
        "varah_swamy",
        "sarjapur_plots",
        "",
      ],
    },
    possession_time: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);