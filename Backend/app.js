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

// 1. Load your ingredients database
// Make sure ingredients.json is in the correct folder
const ingredientDB = require("./uploads/ingredients.json");

// 2. Initialize app
const app = express();

// 3. Global middlewares
app.use(cors()); // Allow frontend / phone to connect
app.use(express.json());

// 4. Connect MongoDB
connectDB();

// 5. Clerk middleware before protected routes
app.use(clerkMiddleware());

// 6. Public root route
app.get("/", (req, res) => {
  res.send("NutriScan Backend Running");
});

// 7. Recommendations route (uses Clerk auth inside router)
app.use("/api/recommendations", recommendationsRouter);

// 8. Allergy API routes (protected by Clerk via middleware or controller)
app.use("/api/allergies", allergyRoutes);

// 9. Protected test route
app.get("/protected", (req, res) => {
  const auth = getAuth(req);

  if (!auth || !auth.userId) {
    return res.status(401).json({ message: "Unauthorized - No Clerk token" });
  }

  res.json({
    message: "You are authenticated",
    userId: auth.userId,
  });
});

// 10. Multer: hold image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 11. OCR endpoint
let worker; // Tesseract worker

app.post("/api/ocr", upload.single("file"), async (req, res) => {
  if (!worker) {
    return res.status(503).json({ error: "OCR engine not ready" });
  }
  if (!req.file) {
    console.log("No file received");
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const {
      data: { text },
    } = await worker.recognize(req.file.buffer);
    const results = analyzeText(text);
    res.json({ status: "success", data: results });
  } catch (error) {
    console.error("OCR error:", error);
    res.status(500).json({ error: "Analysis failed on server." });
  }
});

// 12. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 13. Initialize Tesseract worker
(async () => {
  console.log("Initializing Tesseract...");
  worker = await createWorker("eng");
  console.log("✅ Tesseract worker ready!");
})();

// 14. Ingredient analysis logic
function analyzeText(text) {
  const extractedText = text.toLowerCase();
  const flagged = [];

  console.log("Analyzing text...");

  ingredientDB.forEach((ingredient) => {
    if (
      ingredient.name &&
      extractedText.includes(ingredient.name.toLowerCase())
    ) {
      flagged.push(ingredient);
    }
  });

  return { extractedText: text, flaggedIngredients: flagged };
}
