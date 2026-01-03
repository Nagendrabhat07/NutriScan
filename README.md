# 🥗 NutriScan – Smart Food Safety Scanner

NutriScan is a cross-platform mobile application designed to help users make **safer and more informed food choices** by analyzing ingredient lists printed on packaged food products. Many consumers are unaware of allergens, harmful additives, or preservatives present in everyday food items. NutriScan solves this problem by providing a **simple, fast, and reliable ingredient scanning solution**.

---

## 📌 Overview

NutriScan allows users to scan ingredient labels using their mobile device camera or by selecting images from the gallery. Optical Character Recognition (OCR) technology extracts text from the image, which is then analyzed on the backend to detect allergens, unhealthy additives, and preservatives.

The app categorizes food items into easy-to-understand safety levels such as **Healthy**, **Awareness Needed**, or **Allergy Alert**, enabling users to quickly decide whether a product is safe to consume.

---

## 🎯 Problem Statement

- Ingredient labels are difficult to understand
- Allergens are not clearly highlighted
- Harmful chemical additives go unnoticed
- Manual ingredient checking is time-consuming
- People with allergies need instant safety verification

---

## 💡 Solution

NutriScan simplifies food safety analysis by:
- Scanning ingredient lists using OCR
- Detecting allergens based on the user’s allergy profile
- Identifying unhealthy additives and preservatives
- Providing clear safety classification
- Offering personalized food recommendations

---

## 🚀 Key Features

- 📸 **Ingredient Scanning**
  - Scan using camera or gallery images
  - OCR extracts ingredient text accurately

- 🧠 **Smart Ingredient Analysis**
  - Allergen detection based on user profile
  - Identification of harmful additives and preservatives

- 🚨 **Safety Classification**
  - **Healthy** – Safe to consume
  - **Awareness Needed** – Contains unhealthy additives
  - **Allergy Alert** – Contains allergens

- 🍽️ **Allergy-Safe Food Suggestions**
  - Recommends food items that do **not contain the user’s allergens**
  - Personalized suggestions based on allergy preferences
  - Helps users discover safer alternative products
    
- 🧾 **Nutrition & Product Information**
  - Enriched data using OpenFoodFacts API

- 👤 **Secure Authentication**
  - User login and profile management

- ☁️ **Cloud Image Uploads**
  - Efficient image storage and processing

---

## 🔄 Application Workflow

1. User scans ingredient list using camera or gallery  
2. Image is uploaded to Cloudinary  
3. OCR extracts ingredient text  
4. Backend analyzes ingredients  
5. Allergens and additives are detected  
6. Safety result is displayed to the user 

---

## 🛠 Tech Stack

### 📱 Frontend
- React Native (Expo)
- Expo Camera
- Image Picker
- OCR (Tesseract-based)
- NativeWind

### 🖥 Backend
- Node.js
- Express.js
- MongoDB

### 🔐 Authentication
- Clerk Authentication

### ☁️ Services & APIs
- Cloudinary (Image Uploads)
- OpenFoodFacts API (Product & Nutrition Data)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js
- npm or yarn
- Expo CLI
- MongoDB

### Frontend Setup
```bash
git clone https://github.com/your-username/NutriScan.git
cd NutriScan
npm install
npx expo start
```
## 🖥 Backend Setup

```bash
cd backend
npm install
npm run dev
```
---

## 📱 Supported Platforms

- Android  
- iOS  

---

## 🧪 Project Type

- Academic Mini Project  
- Cross-platform Mobile Application  
- Real-world Problem Solving App  

---

## 🌱 Future Enhancements

- Barcode-based product scanning  
- AI-based ingredient risk scoring  
- Multi-language ingredient recognition  
- Offline scanning support  
- Advanced nutrition tracking  

---


## ⭐ Acknowledgements

- OpenFoodFacts Community  
- Expo & React Native Ecosystem  
- Open-source OCR Libraries  


