const winston = require('winston');

module.exports.logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
            level: 'info'
        }),
        /*
        new winston.transports.File({
          filename: '../../logs/server.log',
          format: winston.format.simple(),
          level: 'info'
        })
      */
    ],
});


/*
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
*/