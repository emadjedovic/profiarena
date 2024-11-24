function formatDate(date, locale = 'en-GB', options = {}) {
    if (!date) return 'N/A';
  
    // Ensure the input is a valid Date object
    const validDate = new Date(date);
    if (isNaN(validDate)) return 'N/A';
  
    // Default options: Customize based on your needs
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
  
    // Merge default options with user-specified options
    const formattingOptions = { ...defaultOptions, ...options };
  
    return validDate.toLocaleString(locale, formattingOptions);
  }
  
  module.exports = {
    formatDate,
  };