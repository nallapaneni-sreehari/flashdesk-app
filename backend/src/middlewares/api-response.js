const { Prisma } = require('../generated/prisma');
const logger = require('../utils/logger');

const PRISMA_ERROR_MAP = {
  P2002: { status: 409, message: 'A record with these details already exists' },
  P2003: { status: 400, message: 'Referenced record not found. Please check linked data' },
  P2025: { status: 404, message: 'One or more referenced records could not be found' },
};

const handleResponse = (req, res, next) => {
  res.ok = (code, data, message = "Success", pagination = null) => {
    const response = {
      success: true,
      message,
      data,
    };
    if (pagination) {
      response.pagination = pagination;
    }
    res.status(code).json(response);
  };

  res.fail = (code = 500, error, data = null) => {
    res.status(code).json({
      success: false,
      error: {
        message: error.message || "An error occurred",
      },
      data,
    });
  };

  /**
   * Centralized error handler — logs the error and sends an appropriate response.
   * Handles Prisma errors, custom statusCode errors, and generic 500s.
   * @param {Error} error
   * @param {object} [logContext] - extra fields for structured logging (e.g. { ticketNumber, body })
   */
  res.handleError = (error, logContext = {}) => {
    logger.error({ err: error, ...logContext }, error.message || 'Request failed');

    // Custom application errors (e.g. from services throwing with statusCode)
    if (error.statusCode) {
      return res.fail(error.statusCode, { message: error.message });
    }

    // Prisma known request errors (constraint violations, not found, etc.)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_MAP[error.code];
      if (mapped) {
        return res.fail(mapped.status, { message: mapped.message });
      }
      return res.fail(400, { message: 'Invalid request. Please check your input and try again' });
    }

    // Prisma validation errors (wrong field types, missing required fields)
    if (error instanceof Prisma.PrismaClientValidationError) {
      return res.fail(400, { message: 'Invalid data provided. Please check your input and try again' });
    }

    // Fallback
    res.fail(500, { message: 'Something went wrong. Please try again later' });
  };

  next();
};

module.exports = handleResponse;
