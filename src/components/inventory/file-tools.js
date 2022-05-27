const csv = require("fast-csv");
const {Parser: CsvParser} = require("json2csv");
const fs = require("fs");
const multer = require('multer');
const path = require("path");
const {AppError} = require("../../error");

exports.readCsv = (path, options) => {
    return new Promise((resolve, reject) => {
        const data = [];
        const stream = csv.parseFile(path, options)
            .on('error', () => {
                reject(new AppError('Error during CSV handling', 500, true));
            })
            .on('data', row => data.push(row)
            )
            .on('end', () => {
                stream.end();
                resolve(data);
            });
    });
};

exports.generateCsvFile = (fields, data) => {
    return new Promise((resolve, reject) => {
        try {
            const parsedData = new CsvParser(fields).parse(data);
            resolve(parsedData);
        } catch (err) {
            reject(false);
        }
    });
};

exports.deleteFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.rm(path, (err) => {
            if (err) {
                reject(new AppError('Failed to delete file after processing', 500, true));
            }
        });
        resolve();
    })
};

// used for making sure its only CSV that gets accepted
const csvFilter = (req, file, cb) => {
    if (!file.mimetype.includes('csv')) {
        cb(`Please upload a csv file! current format: ${file.mimetype}`, false);
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__basedir, '/resources/uploads/'));
    },
    filename: (req, file, cb) => {
        let date = new Date();
        cb(null, `${date}-${file.originalname}`);
    },
});

exports.upload = multer({ storage: storage, fileFilter: csvFilter });
