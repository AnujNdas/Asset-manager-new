const getErrorMessage = require("../utils/getErrorMessage");

module.exports = (err, req, res, next) => {
  // Default values
  const statusCode = err.statusCode || 500;
  const message =
    err.message && typeof err.message === "string"
      ? err.message
      : "Something went wrong";

  res.status(statusCode).json({
    message,
    error:
      process.env.NODE_ENV === "development"
        ? getErrorMessage(err)
        : undefined,
  });
};
