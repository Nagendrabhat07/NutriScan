const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const cors = require('cors');

const fs = require('fs');
const connectDB = require("./config/db");
const allergyRoutes = require("./src/routes/allergy.routes");

// 1. Load your ingredients database
// Make sure ingredients.json is in the same folder!
const ingredientDB = require('./uploads/ingredients.json');


const { clerkMiddleware, getAuth } = require("./src/middleware/clerk.middleware");

require("dotenv").config();
const app = express();
app.use(cors()); 
app.use(express.json());

// connect mongoDB
connectDB();

// Clerk middleware before routes
app.use(clerkMiddleware());

// Public root route
app.get("/", (req, res) => {
  res.send("NutriScan Backend Running");
});

// Allergy API (protected by getAuth inside controller)
app.use("/api/allergies", allergyRoutes);

// protected test route
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

app.use(cors()); // Allow your phone to connect

// 2. Configure Multer to hold the image in memory (RAM) temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// THE API ENDPOINT
app.post('/api/ocr', upload.single('file'), async (req, res) => {
  if (!worker) {
    return res.status(503).json({ error: 'OCR engine not ready' });
  }
  if (!req.file) {
    console.log("No file received");
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const { data: { text } } = await worker.recognize(req.file.buffer);
    const results = analyzeText(text);
    res.json({ status: 'success', data: results });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: 'Analysis failed on server.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 3. Initialize Tesseract (OCR Engine)
let worker;

(async () => {
  console.log("Initializing Tesseract...");
  // In the new version, 'eng' is passed directly, and we await the result
  worker = await createWorker('eng'); 
  console.log('✅ Tesseract worker ready!');
})();

// 4. The Analysis Logic
function analyzeText(text) {
  const extractedText = text.toLowerCase();
  const flagged = [];

  console.log("Analyzing text...");

  ingredientDB.forEach(ingredient => {
    // SAFETY CHECK: Only proceed if ingredient.name exists!
    if (ingredient.name && extractedText.includes(ingredient.name.toLowerCase())) {
      flagged.push(ingredient);
    }
  });

  return { extractedText: text, flaggedIngredients: flagged };
}


