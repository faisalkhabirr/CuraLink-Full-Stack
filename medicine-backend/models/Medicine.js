{/* import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: String,
  purpose: String,
  warnings: String,
  source: { type: String, default: "openFDA" }
});

export default mongoose.model("Medicine", medicineSchema);
*/}

import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    purpose: { type: String, default: "" },
    warnings: { type: String, default: "" },
    source: { type: String, default: "MongoDB" },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
