const multer = require('multer');
const path = require("path");

// used for making sure its only CSV that gets accepted
const csvFilter = (req, file, cb) => {
    if (!file.mimetype.includes('csv')) {
        cb(`Please upload a csv file! current format: ${file.mimetype}`, false);
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__basedir, '/uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage, fileFilter: csvFilter });

module.exports = upload;
