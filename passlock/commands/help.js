const Handler = require("../handler");
const UI = require('../../services/userinterface');

exports.executable = (Args, Commands) => {
    if (Args.length > 0) {
        const getCommand = Args[0].toLowerCase();
        for (const CommandName of Object.keys(Commands)) {
            if (getCommand !== CommandName.toLowerCase()) continue;
            const getDescription = Commands[CommandName].description;
            console.log(` Details about "${CommandName.toLowerCase()}":\n Usage:\n    ${getDescription.usage}\n\n Short Description:\n    ${getDescription.short_description}\n\n Detailed Description:\n    ${(getDescription.detailed_description).replaceAll('\n', '\n    ')}\n`);
            return Handler.userInputSystem();
        };

        return UI.readlineTimer(3, ' This command does not exist.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('menu') });
    } else {
        let commandList = "";
        const tabSize = 16;
        for (const CommandName of Object.keys(Commands)) {
            const getShortDescription = Commands[CommandName].description['short_description'];
            const getDifference = " ".repeat(tabSize - CommandName.length);
            commandList += ` /${CommandName}${getDifference} | ${getShortDescription}\n`;
        }
    
        console.log(' See all commands available below:\n\n' + commandList);
        console.log(' Use "/help <CommandName>" to see more details about a specific command.\n')
        return Handler.userInputSystem();
    }
}

exports.description = {
    usage: `/help <Optional: CommandName>`,
    short_description: `See all commands available or details about a specific one.`,
    detailed_description: `/help | See all the available commands.\n/help <CommandName> | See the details about a specific command.\n\nExamples:\n/help my-passwords\nIt will display all the details and usage of the command "my-passwords".`
}