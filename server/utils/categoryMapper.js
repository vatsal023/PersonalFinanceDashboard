const mapPlaidCategory = (plaidCategory) => {
  if (!plaidCategory) return "Miscellaneous";

  const category = plaidCategory.toLowerCase();

  if (category.includes("restaurant") || category.includes("food"))
    return "Food & Dining";
  if (category.includes("utility") || category.includes("telecom"))
    return "Bills & Utilities";
  if (category.includes("travel") || category.includes("transport"))
    return "Transport";
  if (category.includes("shopping") || category.includes("clothing"))
    return "Shopping";
  if (category.includes("health") || category.includes("pharmacy"))
    return "Health";
  if (category.includes("entertainment") || category.includes("movies"))
    return "Entertainment";

  return "Miscellaneous";
};

module.exports = { mapPlaidCategory };
