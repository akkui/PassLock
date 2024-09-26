const Handler = require("../handler");

exports.executable = (Args) => {
    process.exit();
}

exports.description = {
    usage: `/exit`,
    short_description: `Closes PassLock.`,
    detailed_description: `It will close the passlock.`
}