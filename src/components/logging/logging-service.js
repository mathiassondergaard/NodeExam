const AdmZip = require("adm-zip");
const path = require("path");

exports.generateLogZip = () => {
    return new Promise((resolve, reject) => {
        const zipper = new AdmZip();
        const outputPath = path.join(__basedir, '/resources/downloads/logs/', 'full_logs.zip');

        zipper.addLocalFolder(path.join(__basedir, '/logs'));
        zipper.writeZip(outputPath, (err) => {
            if (err) {
                reject(false);
            }
            resolve('success');
        });
    });
};


