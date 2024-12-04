const { StatusCodes } = require("http-status-codes");

const pageNotFoundError = (req, res) => {
  const errorCode = StatusCodes.NOT_FOUND;
  res.render("error", { errorCode });
};

const internalServerError = (error, req, res, next) => {
  const errorCode = StatusCodes.INTERNAL_SERVER_ERROR;
  console.log(`ERROR occurred: ${error.stack}`);
  res.render("error", { errorCode });
};

module.exports = {
  pageNotFoundError,
  internalServerError,
};
