const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const cors = require('cors');
const fs = require('fs');
const connectDB = require("./config/db");
const allergyRoutes = require("./src/routes/allergy.routes.js");
const { clerkMiddleware, getAuth } = require("./src/middleware/clerk.middleware.js");
require("dotenv").config();

// --- NEW: Import your Allergy Model ---
// Make sure this path points to where you defined your Mongoose Schema
const Allergy = require("./src/models/Allergy.js"); 

// 1. Load your static ingredients database
const ingredientDB = require('./uploads/ingredients.json');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(clerkMiddleware()); // Clerk handles auth

// Connect MongoDB
connectDB();

// 2. Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => res.send("NutriScan Backend Running"));
app.use("/api/allergies", allergyRoutes);

// Protected Test Route
app.get("/protected", (req, res) => {
  const auth = getAuth(req);
  if (!auth || !auth.userId) {
    return res.status(401).json({ message: "Unauthorized - No Clerk token" });
  }
  res.json({ message: "You are authenticated", userId: auth.userId });
});

// --- UPDATED OCR ENDPOINT ---
// --- UPDATED OCR ENDPOINT (Fixes Allergy Fetching) ---
app.post('/api/ocr', upload.single('file'), async (req, res) => {
  if (!worker) {
    return res.status(503).json({ error: 'OCR engine not ready' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // 1. Get User ID from Clerk token
    const auth = getAuth(req);
    const userId = auth.userId; // This is e.g. "user_35jc..."

    // 2. Fetch User's Allergies from MongoDB
    let userAllergyNames = []; // This will hold ["Peanuts", "Milk", "Soy"]
    if (userId) {
      // --- THE FIX IS HERE ---
      // Use .find() to get ALL documents for this user
      // Use clerkId to match your database field
      const allergyDocuments = await Allergy.find({ clerkId: userId });
      
      // Map the documents to just get an array of names
      userAllergyNames = allergyDocuments.map(doc => doc.name);
    }
    
    console.log(`User ${userId || 'Guest'} has allergies:`, userAllergyNames);

    // 3. Run OCR
    console.log("   Running OCR...");
    const { data: { text } } = await worker.recognize(req.file.buffer);
    console.log("   OCR Complete.");

    // 4. Analyze Text (Passing the cleaned array of names)
    const results = analyzeText(text, userAllergyNames);

    res.json({ status: 'success', data: results });

  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: 'Analysis failed on server.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Initialize Tesseract
let worker;
(async () => {
  console.log("Initializing Tesseract...");
  worker = await createWorker('eng'); 
  console.log('✅ Tesseract worker ready!');
})();

// --- UPDATED ANALYSIS LOGIC ---
function analyzeText(text, userAllergies = []) {
  const extractedText = text.toLowerCase();
  const flagged = [];

  console.log("Analyzing text...");

  // A. Check against Static Ingredients (ingredients.json)
  ingredientDB.forEach(ingredient => {
    if (ingredient.name && extractedText.includes(ingredient.name.toLowerCase())) {
      flagged.push(ingredient);
    }
  });

  // B. Check against User Specific Allergies (MongoDB)
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