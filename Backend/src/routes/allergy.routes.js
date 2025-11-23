const express = require("express");
const router = express.Router();

const {
  getAllergies,
  createAllergy,
  deleteAllergy,
} = require("../controllers/allergy.controller");

router.get("/", getAllergies);
router.post("/", createAllergy);
router.delete("/:id", deleteAllergy);

module.exports = router;
