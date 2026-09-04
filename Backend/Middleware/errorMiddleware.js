export const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode) || 500;
  let message = err.message || "Internal Server Error";

  // 1. Handle express.json() malformed JSON safely
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON payload";
  }

  // 2. Map known Mongoose/DB errors to avoid exposing internal details
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered";
  }

  const isProduction = process.env.NODE_ENV === "production";

  // 3. Mask unhandled/500 errors in production
  if (isProduction && statusCode >= 500) {
    message = "Internal Server Error";
  }

  const response = { message };

  // 4. Provide stack trace only in development
  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
