const mongoose = require("mongoose");

const allergySchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  name: { type: String, required: true },
  severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Allergy", allergySchema);
