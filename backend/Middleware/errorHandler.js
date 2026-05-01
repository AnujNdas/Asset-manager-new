const errorHandler = (err, req, res, next) => {
  console.error("💥 GLOBAL ERROR:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    code: err.code || "SERVER_ERROR",
    message: err.message || "Something went wrong",
    errors: err.errors || null,
    meta: err.meta || null
  });
};

module.exports = errorHandler;