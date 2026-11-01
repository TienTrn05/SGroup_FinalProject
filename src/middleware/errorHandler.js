import ApiError from "../core/error.response.js";

const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
  }

  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof ApiError) {
    const response = {
      success: false,
      message: err.message,
    };

    if (err.errors) response.errors = err.errors;
    return res.status(err.statusCode).json(response);
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;
