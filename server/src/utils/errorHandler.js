/**
 * Standardized error handling for controllers
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
export const handleError = (res, error) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    // Handle Mongoose validation errors
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }
  
  if (error.code === 11000) {
    // Handle duplicate key errors
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    });
  }
  
  if (error.name === 'CastError') {
    // Handle invalid ID errors
    return res.status(404).json({
      success: false,
      message: `Resource not found with id of ${error.value}`
    });
  }
  
  // Default error message
  res.status(500).json({
    success: false,
    message: error.message || 'Server Error'
  });
}; 