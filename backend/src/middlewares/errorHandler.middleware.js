/* eslint-disable no-unused-vars */
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(status).json({
    success: false,
    data: null,
    error: { code, message: err.message || 'Something went wrong' },
    meta: {},
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` },
    meta: {},
  });
}
