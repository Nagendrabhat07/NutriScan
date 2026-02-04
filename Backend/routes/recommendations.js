const express = require("express");
const axios = require("axios");
const { requireAuth } = require("@clerk/express");
const Allergy = require("../src/models/Allergy");
const { normalizeName, isMatch } = require("../utils/ingredientUtils");

const router = express.Router();

const OFF_SEARCH_URL =
  "https://world.openfoodfacts.org/cgi/search.pl?search_terms=healthy&search_simple=1&action=process&json=1&page_size=30";

// remove these religious labels
const BLOCKED_RELIGIOUS_LABELS = ["kosher", "halal"];

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

      // small description
      const description =
        p.generic_name ||
        (p.brands ? `From ${p.brands}` : "Safe option based on your allergies.");

      if (!imageUrl) continue;

      // ---------- EXTRA FIELDS ----------

      // category (take 1st category to keep short)
      let category = null;
      if (p.categories && typeof p.categories === "string") {
        category = p.categories.split(",")[0].trim();
      } else if (Array.isArray(p.categories_tags) && p.categories_tags.length > 0) {
        category = p.categories_tags[0]
          .replace(/^en:/, "")
          .replace(/-/g, " ");
      }

      // NutriScore grade (a, b, c...)
      const nutriScore = p.nutriscore_grade || null;

      // labels (organic, vegan, etc)
      let labelsRaw = [];
      if (Array.isArray(p.labels_tags) && p.labels_tags.length > 0) {
        labelsRaw = p.labels_tags.map((tag) =>
          tag.replace(/^en:/, "").replace(/-/g, " ")
        );
      } else if (typeof p.labels === "string" && p.labels.trim().length > 0) {
        labelsRaw = p.labels
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);
      }

      // remove religious labels: kosher / halal
      const labels = labelsRaw.filter(
        (l) => !BLOCKED_RELIGIOUS_LABELS.includes(l.toLowerCase())
      );

      // ---------- ALLERGY CHECK ----------
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

          // new stuff for frontend
          category,   // string | null
          nutriScore, // string | null ("a"/"b"/...)
          labels,     // array of strings
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
