const winston = require('winston');

module.exports.logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            level: 'info',
        }),
        new winston.transports.File({
          filename: 'logs/server.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
          level: 'info',
        }),
    ],
});