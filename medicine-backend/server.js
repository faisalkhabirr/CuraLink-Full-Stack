{/*// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Medicine from "./models/Medicine.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- MONGODB CONNECTION --------------------
mongoose.connect(process.env.MONGO_URI) // no extra options
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// -------------------- SEARCH MEDICINES --------------------
app.get("/api/search", async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.json([]);

  try {
    const result = await Medicine.findOne({ name: { $regex: query, $options: "i" } });
    res.json(result ? [result] : []);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch medicine data" });
  }
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

*/}

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Medicine from "./models/Medicine.js";

dotenv.config();

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- MongoDB Connection ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ---------- Health Check ----------
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- READ (List all medicines) ----------
app.get("/api/medicines", async (req, res) => {
  try {
    const items = await Medicine.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(items);
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});

// ---------- READ (Search by name) ----------
app.get("/api/search", async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.json([]);

  try {
    const result = await Medicine.find({
      name: { $regex: query, $options: "i" },
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json(result);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to search medicine data" });
  }
});

// ---------- CREATE ----------
app.post("/api/medicines", async (req, res) => {
  try {
    const { name, purpose, warnings, source } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const medicine = new Medicine({
      name: name.trim(),
      purpose: purpose ?? "",
      warnings: warnings ?? "",
      source: source ?? "MongoDB",
    });

    const saved = await medicine.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Add error:", err);

    if (err?.code === 11000) {
      return res.status(409).json({ error: "Medicine name already exists" });
    }

    res.status(500).json({ error: "Failed to add medicine" });
  }
});

// ---------- UPDATE ----------
app.put("/api/medicines/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { _id, ...safeBody } = req.body;

    if (safeBody.name && !safeBody.name.trim()) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    if (safeBody.name) safeBody.name = safeBody.name.trim();

    const updated = await Medicine.findByIdAndUpdate(id, safeBody, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);

    if (err?.code === 11000) {
      return res.status(409).json({ error: "Medicine name already exists" });
    }

    res.status(500).json({ error: "Failed to update medicine" });
  }
});

// ---------- DELETE ----------
app.delete("/api/medicines/:id", async (req, res) => {
  try {
    const deleted = await Medicine.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    res.json({ message: "Medicine deleted", id: deleted._id });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete medicine" });
  }
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
