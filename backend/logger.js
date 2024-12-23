// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Default level is info
  format: winston.format.json(),
  transports: [
    // An info logger
    new winston.transports.File({ filename: 'logs/auth-service.log' }),
    // An error logger, capturing only error-level logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' // This will log only error messages
    }),
  ],
});

module.exports = logger;