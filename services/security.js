const crypto = require('crypto');

const localKey = "3c3e8d7edfb1febc75548f58b8752c862d48fa7af9a715ac2cedddc81607e1b9";
const localIV = "5304cc87d87abecdb7bce78af2e85746";

exports.error_ocurred = (ErrorDetails) => {
    console.clear();
    return console.log(ErrorDetails)
};

exports.encrypt = (Key, IV, Content) => {
    if (Key === "localkey") Key = localKey;
    if (IV === "localiv") IV = localIV;

    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(Key, 'hex'), Buffer.from(IV, 'hex'));
        let encrypted = cipher.update(Content, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    } catch (failed) {
        return this.error_ocurred(failed);
    }
}

exports.decrypt = (Key, IV, Content) => {
    if (Key === "localkey") Key = localKey;
    if (IV === "localiv") IV = localIV;

    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(Key, 'hex'), Buffer.from(IV, 'hex'));
        let decrypted = decipher.update(Content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (failed) {
        return this.error_ocurred(failed);
    }
}

exports.passwordGenerator = (Size) => {
    const Caracters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let Password = '';
    for (let i = 0; i < Size; i++) {
        const indice = Math.floor(Math.random() * Caracters.length);
        Password += Caracters[indice];
    }
    return Password;
}