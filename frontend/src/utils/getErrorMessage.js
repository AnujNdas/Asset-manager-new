const getErrorMessage = (err, fallback = "Something went wrong") => {
  const error = err?.normalized;

  if (!error) return fallback;

  switch (error.status) {
    case 400:
    case 403:
    case 409:
      return error.message;

    case 404:
      return "Requested resource not found";

    case 500:
      return "Server error. Please try again later.";

    default:
      return error.message || fallback;
  }
};