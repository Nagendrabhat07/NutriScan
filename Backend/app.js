const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const cors = require('cors');

// 1. Load your ingredients database
// Make sure ingredients.json is in the same folder!
const ingredientDB = require('./uploads/ingredients.json');

const app = express();
app.use(cors()); // Allow your phone to connect

// 2. Configure Multer to hold the image in memory (RAM) temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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