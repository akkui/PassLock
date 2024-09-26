//Carrega as APIs.
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const os = require('os');

//Carrega os serviços.
const Security = require('./security');

//Define as variáveis globais.
global.appdata = path.join(os.homedir(), 'AppData', 'Roaming');
const AppFolder = path.join(global.appdata, 'PassLock');
const storageFilepath = path.join(AppFolder, 'storage.passlock');
const sessionFilepath = path.join(AppFolder, 'session.passlock');

exports.load = () => {
    if (!fs.existsSync(AppFolder)) fs.mkdirSync(AppFolder);

    if (!fs.existsSync(sessionFilepath)) {
        fs.writeFileSync(sessionFilepath, Security.encrypt('localkey', 'localiv', JSON.stringify({
            serviceVersion: 1,
            sessionIV: crypto.randomBytes(16).toString('hex'),
            masterPasswordHash: ""
        })));
    } else {
        const storageExists = fs.existsSync(storageFilepath);
        let readSession = this.read('session.passlock', 'localkey', 'localiv');
        if (readSession.masterPassword !== "" && !storageExists) return this.datawipe();
    }
}

exports.generateCryptographedDatabase = (Key) => {
    const KeyBuffer = crypto.pbkdf2Sync(Key, '', 100000, 32, 'sha256').toString('hex');
    const KeyHash = crypto.createHash('sha256').update(KeyBuffer).digest('hex')

    let getSession = this.read('session.passlock', 'localkey', 'localiv');

    fs.writeFileSync(storageFilepath, Security.encrypt(KeyBuffer, getSession.sessionIV, JSON.stringify({
        serviceVersion: 1,
        passwords: {},
        emails: {}
    })));

    getSession.masterPasswordHash = KeyHash;
    this.edit('session.passlock', 'localkey', 'localiv', getSession);
}

exports.datawipe = () => {
    if (fs.existsSync(storageFilepath)) fs.rmSync(storageFilepath);
    if (fs.existsSync(sessionFilepath)) fs.rmSync(sessionFilepath);
    return this.load();
}

exports.read = (File, Key, IV) => {
    const generateFilepath = path.join(AppFolder, File);
    const checkFileExistent = fs.existsSync(generateFilepath);
    if (!checkFileExistent) return Security.error_ocurred("Trying to acess file that doesn't exist.");

    try {
        const readFile = fs.readFileSync(generateFilepath, 'utf-8');
        const uncryptContent = Security.decrypt(Key, IV, readFile);
        const parseContent = JSON.parse(uncryptContent);
        return parseContent;
    } catch (failed) {
        return Security.error_ocurred({
            message: 'Failed at the process of acessing a cryptographed file content.',
            error_message: failed
        });
    }
}

exports.edit = (File, Key, IV, editedContent) => {
    const generateFilepath = path.join(AppFolder, File);
    const checkFileExistent = fs.existsSync(generateFilepath);
    if (!checkFileExistent) return Security.error_ocurred("Trying to acess file that doesn't exist.");
    if (!editedContent) return Security.error_ocurred("An error ocurred while trying to edit a file without a new content. (Empty content)");

    try {
        const readFile = fs.readFileSync(generateFilepath, 'utf-8');
        const uncryptContent = Security.decrypt(Key, IV, readFile);
        JSON.parse(uncryptContent); //Just to see if an error ocurred.
        const encryptNewData = Security.encrypt(Key, IV, JSON.stringify(editedContent));
        fs.writeFileSync(generateFilepath, encryptNewData);
    } catch (failed) {
        return Security.error_ocurred({
            message: 'Failed at the process of acessing a cryptographed file content.',
            error_message: failed
        });
    }
}