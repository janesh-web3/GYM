import expressAsyncHandler from 'express-async-handler';

/**
 * Async handler to wrap async route handlers and catch errors
 * Eliminates the need for try/catch blocks in controllers
 * @param {Function} fn - Async function to execute 
 * @returns {Function} Middleware function with error handling
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 