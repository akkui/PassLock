const Handler = require("../handler");
const UI = require('../../services/userinterface');
const Security = require('../../services/security');

const Crypto = require('crypto');
const Storage = require('../../services/storage');

const Commands = {
    "list": () => {
        const readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        if (Object.keys(readStorage.passwords).length > 0) {
            let longest_ID = 0;
            let longest_PASSWORD = 0;
            for (const ID in readStorage.passwords) {
                if (ID.length > longest_ID) longest_ID = ID.length;
                if (readStorage.passwords[ID].length > longest_PASSWORD) longest_PASSWORD = readStorage.passwords[ID].length;
            }

            const Head = `| ID${" ".repeat(longest_ID - 2)} | PASSWORD${" ".repeat(longest_PASSWORD - 8)} |`;
            const Line = "-".repeat(Head.length - 2)

            const Top = ` Here is a list of all your passwords and IDs:\n\n |${Line}|\n ${Head}\n |${Line}|`;

            console.log(Top);
            for (const ID in readStorage.passwords) {
                const PASSWORD = readStorage.passwords[ID];
                let HudGen = ` | ${ID + " ".repeat(longest_ID - ID.length)} | ${PASSWORD + " ".repeat(longest_PASSWORD - PASSWORD.length)} |`;
                console.log(HudGen)
            };
            
            console.log(` |${Line}|\n\n For more details, use "/help my-passwords".\n`);
        } else {
            console.log(" There is no saved password yet.\n");
        };

        return Handler.userInputSystem();
    },
    "get": (Args) => {
        const ID = Args[0];
        if (!ID) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-passwords" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });

        const readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        const getPassword = readStorage.passwords[ID];
        if (!getPassword) return UI.readlineTimer(5, ' Does not exist any password save with this ID. Use "/my-passwords list".\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });

        console.log(` Seeing details about a password:\n ID: ${ID}\n Password: ${getPassword}\n`);
        return Handler.userInputSystem();
    },
    "add": (Args) => {
        const ID = Args[0];
        const PASSWORD = Args[1];

        if (!ID) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-passwords" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });
        if (!PASSWORD) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-passwords" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });

        let readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        if (readStorage.passwords[ID]) return UI.readlineTimer(5, ' Already exist a password saved with this ID. Try another.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });

        readStorage.passwords[ID] = PASSWORD;

        Storage.edit('storage.passlock', global.keyBuffer, global.ivBuffer, readStorage);

        return Handler.executeCommand('my-passwords', ['get', ID]);
    },
    "delete": (Args) => {
        const ID = Args[0];
        if (!ID) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-passwords" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });

        let readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        const getPassword = readStorage.passwords[ID];
        if (!getPassword) return UI.readlineTimer(5, ' Does not exist any password save with this ID. Use "/my-passwords list".\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });

        delete readStorage.passwords[ID];
        Storage.edit('storage.passlock', global.keyBuffer, global.ivBuffer, readStorage);
        
        return UI.readlineTimer(5, ' That password was sucessfully deleted!\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });
    },
    "generate": (Args) => {
        const ID = Args[0];
        const LENGTH = Args[1];
        if (!ID) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-passwords" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });
        if (!LENGTH) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-passwords" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });
        if (isNaN(Number(LENGTH))) return UI.readlineTimer(5, ' You need to provide a valid value (1~64).\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });
        if (Number(LENGTH) < 1 || Number(LENGTH) > 64) return UI.readlineTimer(5, ' You need to provide a valid value (1~64).\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });

        let readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        if (readStorage.passwords[ID]) return UI.readlineTimer(5, ' Already exist a password saved with this ID. Try another.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });

        readStorage.passwords[ID] = Security.passwordGenerator(Number(LENGTH));
        Storage.edit('storage.passlock', global.keyBuffer, global.ivBuffer, readStorage);

        return Handler.executeCommand('my-passwords', ['get', ID]);
    }
}

exports.executable = (Args) => {
    if (!Args[0]) {
        console.log(" " + this.description.detailed_description.replaceAll("\n", "\n ") + "\n");
        return Handler.userInputSystem();
    };

    const getCommand = Args[0];
    Args.shift();

    if (!Object.keys(Commands).includes(getCommand)) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-passwords" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-passwords') });
    return Commands[getCommand](Args);
}

exports.description = {
    usage: `/my-passwords <SubCommand> <Args...>`,
    short_description: `See all "my-passwords" subcommands.`,
    detailed_description: "/my-passwords list | See all the passwords saved.\n/my-passwords get [ID] | Get the password saved for the ID.\n/my-passwords add [ID] [PASSWORD] | Save a password.\n/my-passwords delete [ID] | Delete a password.\n/my-passwords generate [ID] [LENGTH 1~64] | Generate a secure password with a specific length.\n\nExample:\n/my-passwords add GoogleAccount 123456789\n/my-passwords get GoogleAccount\n/my-passwords remove GoogleAccount\n/my-passwords generate GoogleAccount 32"
}