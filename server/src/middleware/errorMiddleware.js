export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ");
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `An account with this ${field} already exists.` : "Duplicate entry detected.";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid input format for ${err.path}`;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session invalid or expired. Please log in again.";
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

