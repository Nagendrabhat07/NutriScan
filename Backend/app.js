const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const cors = require('cors');
<<<<<<< HEAD
const fs = require('fs');
const connectDB = require("./config/db");
const allergyRoutes = require("./src/routes/allergy.routes");
=======

// 1. Load your ingredients database
// Make sure ingredients.json is in the same folder!
const ingredientDB = require('./uploads/ingredients.json');
>>>>>>> 291cfc44d053a578fb07c267b226ddf0e1d1786b

const { clerkMiddleware, getAuth } = require("./src/middleware/clerk.middleware");

require("dotenv").config();
const app = express();
<<<<<<< HEAD
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
=======
app.use(cors()); // Allow your phone to connect
>>>>>>> 291cfc44d053a578fb07c267b226ddf0e1d1786b

// 2. Configure Multer to hold the image in memory (RAM) temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

<<<<<<< HEAD
// THE API ENDPOINT
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  console.log("Received image for OCR...");

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;

    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { logger: m => console.log(m) }
    );

    console.log("OCR Result:", text);

    fs.unlinkSync(imagePath);

    res.json({ 
      status: 'success', 
      extractedText: text 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'OCR failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
=======
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


// 5. The API Endpoint
// Note: Matches the URL in your React Native app: /api/ocr
app.post('/api/ocr', upload.single('file'), async (req, res) => {
  console.log("📸 Received image scan request...");

  if (!req.file) {
    console.log("❌ No file found in request");
    return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
  }

  try {
    // A. Run OCR (Image -> Text)
    console.log("   Running OCR...");
    const { data: { text } } = await worker.recognize(req.file.buffer);
    console.log("   OCR Complete. Found text length:", text.length);

    // B. Run Analysis (Text -> Flagged Ingredients)
    const results = analyzeText(text);
    console.log("   Analysis Complete. Flagged items:", results.flaggedIngredients.length);

    // C. Send Response
    res.json({ 
      status: 'success', 
      data: results 
    });

  } catch (error) {
    console.error('❌ Error during processing:', error);
    res.status(500).json({ status: 'error', message: 'Analysis failed on server.' });
  }
});

// 6. Start the Server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   (Ensure your phone and PC are on the same Wi-Fi)`);
});
>>>>>>> 291cfc44d053a578fb07c267b226ddf0e1d1786b
