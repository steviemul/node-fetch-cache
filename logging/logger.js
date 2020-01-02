const winston = require('winston');
const LEVEL = process.env.NODE_FETCH_LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: LEVEL,
  format: winston.format.json(),
  defaultMeta: {
    service: 'cache-service'
  },
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'combined.log'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
