/**
 * Standardized API response helpers
 */

const successResponse = (res, { message = 'Success', data = null, statusCode = 200, pagination = null } = {}) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, { message = 'Something went wrong', statusCode = 500, errors = null } = {}) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const paginationMeta = (total, page, limit) => ({
  total,
  page: parseInt(page),
  limit: parseInt(limit),
  pages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1
});

module.exports = { successResponse, errorResponse, paginationMeta };
