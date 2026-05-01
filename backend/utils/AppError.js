class AppError extends Error {
  constructor(message, statusCode = 500, code = "SERVER_ERROR", errors = null, meta = null) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors; // field-level errors
    this.meta = meta;     // extra info (limits, counts, etc.)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;