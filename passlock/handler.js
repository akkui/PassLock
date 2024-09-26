//Carrega os serviços.
const UI = require('../services/userinterface');

const commands = {
    'my-passwords': require('./commands/my-passwords'),
    'my-emails': require('./commands/my-emails'),
    'help': require('./commands/help'),
    'back': require('./commands/back'),
    'exit': require('./commands/exit')
}

exports.executeCommand = async (Command, Args = []) => {
    process.stdout.write('\x1b[1;1H');
    UI.outputLogo(true);

    if (!Object.keys(commands).includes(Command)) return UI.readlineTimer(3, ' This command does not exist.\n You will be redirected to the menu in [TIME] seconds.', () => { return this.executeCommand('back'); });
    return await commands[Command].executable(Args, commands);
};

exports.userInputSystem = () => {
    global.RL.question(' => /', async (Input) => {
        const getInputMetadata = Input.split(" ");
        const getCommand = getInputMetadata[0] || false;
        const getArgs = (getInputMetadata.length > 1) ? (() => { getInputMetadata.shift(); return getInputMetadata.filter(e => e !== ""); })() : [];
        return await this.executeCommand(getCommand, getArgs);
    });
};

exports.load = () => { this.executeCommand('back'); };