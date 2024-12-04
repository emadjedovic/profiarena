function formatDate(date, locale = "en-GB", options = {}) {
  if (!date) return "N/A";

  const validDate = new Date(date);
  if (isNaN(validDate)) return "N/A";

  const defaultOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const formattingOptions = { ...defaultOptions, ...options };

  return validDate.toLocaleString(locale, formattingOptions);
}

module.exports = {
  formatDate,
};
