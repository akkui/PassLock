//Carrega as APIs.
const crypto = require('crypto');

//Carrega os serviços.
const Handler = require('./handler');
const Storage = require('../services/storage');
const UI = require('../services/userinterface');

exports.auth = (Key) => {
    const getSession = Storage.read('session.passlock', 'localkey', 'localiv');

    const KeyBuffer = crypto.pbkdf2Sync(Key, '', 100000, 32, 'sha256').toString('hex');
    const KeyHash = crypto.createHash('sha256').update(KeyBuffer).digest('hex')

    const PassAuth = getSession.masterPasswordHash === KeyHash;

    if (!PassAuth) return UI.readlineTimer(5, ` [!] Wrong master password.\n You will be redirected to the menu in [TIME] seconds.`, () => {
        return UI.load();
    })

    global.ivBuffer = getSession.sessionIV;
    global.keyBuffer = KeyBuffer;
    Handler.load();
};