const getErrorMessage = (error) => {
  if (!error) return "Unknown error";

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    return Object.values(error.errors)
      .map(e => e.message)
      .join(", ");
  }

  // Duplicate key errors
  if (error.code === 11000 && error.keyValue) {
    const field = Object.keys(error.keyValue)[0];
    return `${field} already exists`;
  }

  // Cast / ObjectId errors
  if (error.name === "CastError") {
    return "Invalid ID format";
  }

  return error.message || "Unexpected error";
};

module.exports = getErrorMessage;
