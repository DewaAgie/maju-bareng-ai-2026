/**
 * Async handler wrapper to avoid repetitive try/catch blocks in route handlers.
 * Catches any error thrown by the async function and passes it to Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
