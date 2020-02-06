const logger = function(req, res, next) {
  console.log('[server] Request URL:', req.originalUrl);
  next();
};

module.exports = {
  logger
};
