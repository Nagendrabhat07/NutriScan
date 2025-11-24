const express = require("express");
const axios = require("axios");
const { requireAuth } = require("@clerk/express");
const Allergy = require("../src/models/Allergy");
const { normalizeName, isMatch } = require("../utils/ingredientUtils");

const router = express.Router();

const OFF_SEARCH_URL =
  "https://world.openfoodfacts.org/cgi/search.pl?search_terms=healthy&search_simple=1&action=process&json=1&page_size=30";

router.get("/healthy", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId; // from Clerk

    // your schema uses clerkId, not userId
    const allergies = await Allergy.find({ clerkId: userId });

    const allergyNames = allergies.map((a) => a.name);

    const offResponse = await axios.get(OFF_SEARCH_URL);
    const products = offResponse.data.products || [];

    const safeItems = [];

    for (const p of products) {
      const name =
        p.product_name ||
        p.generic_name ||
        (p.brands ? `${p.brands} product` : "Food item");

      const imageUrl =
        p.image_front_small_url ||
        p.image_front_url ||
        p.image_url ||
        null;

      const ingredientsText = p.ingredients_text || "";

      // cleaner description
      const description =
        p.generic_name ||
        (p.brands ? `From ${p.brands}` : "Safe option based on your allergies.");

      if (!imageUrl) continue;

      let hasAllergy = false;
      for (const allergy of allergyNames) {
        if (
          isMatch(ingredientsText, allergy) ||
          normalizeName(ingredientsText).includes(normalizeName(allergy))
        ) {
          hasAllergy = true;
          break;
        }
      }

      if (!hasAllergy) {
        safeItems.push({
          id: p._id || p.id || p.code,
          name,
          imageUrl,
          description,
          ingredientsText,
        });
      }
    }

    return res.json({ items: safeItems });
  } catch (err) {
    console.error("Healthy recommendations error:", err?.response?.data || err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
