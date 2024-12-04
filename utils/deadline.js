const getDateRange = (range) => {
  const today = new Date();
  let startDate, endDate;

  switch (range) {
    case "today":
      startDate = formatDate(today);
      endDate = formatDate(today);
      break;

    case "7days":
      startDate = formatDate(today);
      endDate = formatDate(new Date(today.setDate(today.getDate() + 7)));
      break;

    case "thisMonth":
      startDate = formatDate(
        new Date(today.getFullYear(), today.getMonth(), 1)
      );
      endDate = formatDate(
        new Date(today.getFullYear(), today.getMonth() + 1, 0)
      );
      break;

    case "past":
      endDate = formatDate(today);
      startDate = null;
      break;

    default:
      throw new Error(`Invalid deadline range: ${range}`);
  }

  return { startDate, endDate };
};

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

module.exports = { getDateRange, formatDate };
