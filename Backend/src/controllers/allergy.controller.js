const Allergy = require("../models/Allergy");
const { getAuth } = require("../middleware/clerk.middleware");

// GET /api/allergies
exports.getAllergies = async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const allergies = await Allergy.find({ clerkId: auth.userId }).sort({ createdAt: -1 });
    return res.json(allergies);  // 👈 array of docs with .name
  } catch (err) {
    console.error("Error fetching allergies:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// POST /api/allergies
exports.createAllergy = async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { name, severity, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Allergy name is required" });
    }

    const allergy = await Allergy.create({
      clerkId: auth.userId,
      name: name.trim(),           // 👈 this is what frontend expects
      severity: severity || "medium",
      notes: notes || "",
    });

    return res.status(201).json(allergy);
  } catch (err) {
    console.error("Error creating allergy:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/allergies/:id
exports.deleteAllergy = async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id } = req.params;

    const deleted = await Allergy.findOneAndDelete({
      _id: id,
      clerkId: auth.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting allergy:", err);
    res.status(500).json({ message: "Server error" });
  }
};
