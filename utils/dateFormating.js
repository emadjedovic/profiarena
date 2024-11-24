function formatDate(date, locale = 'en-GB', options = {}) {
  if (!date) return 'N/A';

  // Ensure the input is a valid Date object
  const validDate = new Date(date);
  if (isNaN(validDate)) return 'N/A';

  // Default options: Exclude time completely (no hour, minute, or second)
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  // Merge default options with user-specified options
  const formattingOptions = { ...defaultOptions, ...options };

  return validDate.toLocaleString(locale, formattingOptions);
}

module.exports = {
  formatDate,
};
