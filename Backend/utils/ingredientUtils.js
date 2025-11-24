function normalizeName(name = "") {
  return name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function isMatch(text, allergyName) {
  const t = normalizeName(text);
  const a = normalizeName(allergyName);
  return t.includes(a);
}

module.exports = { normalizeName, isMatch };
