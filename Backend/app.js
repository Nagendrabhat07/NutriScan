const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const fs = require('fs');
const connectDB = require("./config/db");
const allergyRoutes = require("./src/routes/allergy.routes");

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

// Configure Multer
const upload = multer({ dest: 'uploads/' });

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
