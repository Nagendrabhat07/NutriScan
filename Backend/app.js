<<<<<<< HEAD
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
=======
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
>>>>>>> 57e462a48aeb2593150d11c745062fc9f305f601
app.use(express.json());
app.use(clerkMiddleware()); // Clerk handles auth

<<<<<<< HEAD
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
=======
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
>>>>>>> 57e462a48aeb2593150d11c745062fc9f305f601
  if (!worker) {
    return res.status(503).json({ error: "OCR engine not ready" });
  }
  if (!req.file) {
<<<<<<< HEAD
    console.log("No file received");
    return res.status(400).json({ error: "No file uploaded" });
=======
    return res.status(400).json({ error: 'No file uploaded' });
>>>>>>> 57e462a48aeb2593150d11c745062fc9f305f601
  }

  try {
<<<<<<< HEAD
    const {
      data: { text },
    } = await worker.recognize(req.file.buffer);
    const results = analyzeText(text);
    res.json({ status: "success", data: results });
=======
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

>>>>>>> 57e462a48aeb2593150d11c745062fc9f305f601
  } catch (error) {
    console.error("OCR error:", error);
    res.status(500).json({ error: "Analysis failed on server." });
  }
});

// 12. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

<<<<<<< HEAD
// 13. Initialize Tesseract worker
(async () => {
  console.log("Initializing Tesseract...");
  worker = await createWorker("eng");
  console.log("✅ Tesseract worker ready!");
})();

// 14. Ingredient analysis logic
function analyzeText(text) {
=======
// Initialize Tesseract
let worker;
(async () => {
  console.log("Initializing Tesseract...");
  worker = await createWorker('eng'); 
  console.log('✅ Tesseract worker ready!');
})();

// --- UPDATED ANALYSIS LOGIC ---
function analyzeText(text, userAllergies = []) {
>>>>>>> 57e462a48aeb2593150d11c745062fc9f305f601
  const extractedText = text.toLowerCase();
  const flagged = [];

  console.log("Analyzing text...");

<<<<<<< HEAD
  ingredientDB.forEach((ingredient) => {
    if (
      ingredient.name &&
      extractedText.includes(ingredient.name.toLowerCase())
    ) {
=======
  // A. Check against Static Ingredients (ingredients.json)
  ingredientDB.forEach(ingredient => {
    if (ingredient.name && extractedText.includes(ingredient.name.toLowerCase())) {
>>>>>>> 57e462a48aeb2593150d11c745062fc9f305f601
      flagged.push(ingredient);
    }
  });

<<<<<<< HEAD
  return { extractedText: text, flaggedIngredients: flagged };
}
=======
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
>>>>>>> 57e462a48aeb2593150d11c745062fc9f305f601
