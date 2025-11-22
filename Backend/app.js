const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors()); 

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

        // Run Tesseract.js
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng', // Language code
            { logger: m => console.log(m) } // Log progress to console
        );

        console.log("OCR Result:", text);

        // Clean up uploaded file
        fs.unlinkSync(imagePath);

        // Send back to Expo
        res.json({ 
            status: 'success', 
            extractedText: text 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'OCR failed' });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`OCR Server running on port ${PORT}`);
});