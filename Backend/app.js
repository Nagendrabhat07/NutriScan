require("dotenv").config();

const express = require("express");
const multer = require("multer");
const { createWorker } = require("tesseract.js");
const cors = require("cors");
const fs = require("fs");

const connectDB = require("./config/db");
const allergyRoutes = require("./src/routes/allergy.routes");
const recommendationsRouter = require("./routes/recommendations");
const { clerkMiddleware, getAuth } = require("./src/middleware/clerk.middleware");
const Allergy = require("./src/models/Allergy.js"); 
const ingredientDB = require("./uploads/ingredients.json");

const app = express();

// Middlewaresq
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Connect MongoDB
connectDB();

// Routes
app.get("/", (req, res) => res.send("NutriScan Backend Running"));
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/allergies", allergyRoutes);

// Protected Test Route
app.get("/protected", (req, res) => {
  const auth = getAuth(req);
  if (!auth || !auth.userId) {
    return res.status(401).json({ message: "Unauthorized - No Clerk token" });
  }
  res.json({ message: "You are authenticated", userId: auth.userId });
});

// Multer: hold image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Tesseract worker
let worker;

// OCR endpoint
app.post("/api/ocr", upload.single("file"), async (req, res) => {
  if (!worker) {
    return res.status(503).json({ error: "OCR engine not ready" });
  }
  if (!req.file) {
    console.log("No file received");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Get User ID from Clerk token
    const auth = getAuth(req);
    const userId = auth.userId;

    // Fetch User's Allergies from MongoDB
    let userAllergyNames = [];
    if (userId) {
      const allergyDocuments = await Allergy.find({ clerkId: userId });
      userAllergyNames = allergyDocuments.map(doc => doc.name);
    }
    console.log(`User ${userId || 'Guest'} has allergies:`, userAllergyNames);

    // Run OCR
    console.log("   Running OCR...");
    const { data: { text } } = await worker.recognize(req.file.buffer);
    console.log("   OCR Complete.");

    // Analyze Text
    const results = analyzeText(text, userAllergyNames);

    res.json({ status: 'success', data: results });
  } catch (error) {
    console.error("OCR error:", error);
    res.status(500).json({ error: "Analysis failed on server." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Initialize Tesseract worker
(async () => {
  console.log("Initializing Tesseract...");
  worker = await createWorker("eng");
  console.log("✅ Tesseract worker ready!");
})();

// Ingredient analysis logic
function analyzeText(text, userAllergies = []) {
  const extractedText = text.toLowerCase();
  const flagged = [];

  // Check against Static Ingredients (ingredients.json)
  ingredientDB.forEach(ingredient => {
    if (ingredient.name && extractedText.includes(ingredient.name.toLowerCase())) {
      flagged.push(ingredient);
    }
  });

  // Check against User Specific Allergies (MongoDB)
  userAllergies.forEach(allergyName => {
    if (extractedText.includes(allergyName.toLowerCase())) {
      flagged.push({
        name: allergyName,
        category: "⚠️ YOUR ALLERGY",
        explanation: `This product contains ${allergyName}, which you are allergic to.`
      });
    }
  });

  return { 
    extractedText: text, 
    flaggedIngredients: flagged 
  };
}
