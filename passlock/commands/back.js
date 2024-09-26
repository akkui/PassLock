const Handler = require("../handler");

exports.executable = (Args, Commands) => {
    let commandList = "";
    const tabSize = 16;
    for (const CommandName of Object.keys(Commands)) {
        const getShortDescription = Commands[CommandName].description['short_description'];
        const getDifference = " ".repeat(tabSize - CommandName.length);
        commandList += ` /${CommandName}${getDifference} | ${getShortDescription}\n`;
    }k

    console.log(' Welcome to PassLock!\n See all commands available below:\n\n' + commandList);
    return Handler.userInputSystem();
}

exports.description = {
    usage: `/back`,
    short_description: `Go back to the main menu.`,
    detailed_description: `It will go back to the main menu of the PassLock.`
}