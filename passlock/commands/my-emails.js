const Handler = require("../handler");
const UI = require('../../services/userinterface');
const Security = require('../../services/security');

const Crypto = require('crypto');
const Storage = require('../../services/storage');

const Commands = {
    "list": () => {
        const readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        if (Object.keys(readStorage.emails).length > 0) {
            let longest_ID = 0;
            let longest_EMAIL = 0;
            let longest_PASSWORD = 0;
            for (const ID in readStorage.emails) {
                if (ID.length > longest_ID) longest_ID = ID.length;
                if (readStorage.emails[ID].email.length > longest_EMAIL) longest_EMAIL = readStorage.emails[ID].email.length;
                if (readStorage.emails[ID].password.length > longest_PASSWORD) longest_PASSWORD = readStorage.emails[ID].password.length;
            }

            const Head = `| ID${" ".repeat(longest_ID - 2)} | E-MAIL${" ".repeat(longest_EMAIL - 5)} | PASSWORD${" ".repeat(longest_PASSWORD - 8)} |`;
            const Line = "-".repeat(Head.length - 2)

            const Top = ` Here is a list of all your e-mails accounts and IDs:\n\n |${Line}|\n ${Head}\n |${Line}|`;

            console.log(Top);
            for (const ID in readStorage.emails) {
                const EMAIL = readStorage.emails[ID].email;
                const PASSWORD = readStorage.emails[ID].password;
                let HudGen = ` | ${ID + " ".repeat(longest_ID - ID.length)} | ${EMAIL + " ".repeat(longest_EMAIL - EMAIL.length + 1)} | ${PASSWORD + " ".repeat(longest_PASSWORD - PASSWORD.length)} |`;
                console.log(HudGen)
            };
            
            console.log(` |${Line}|\n\n For more details, use "/help my-emails".\n`);
        } else {
            console.log(" There is no saved e-mails accounts yet.\n");
        };

        return Handler.userInputSystem();
    },
    "get": (Args) => {
        const ID = Args[0];
        if (!ID) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });

        const readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        const getEmail = readStorage.emails[ID];
        if (!getEmail) return UI.readlineTimer(5, ' Does not exist any e-mail account saved with this ID. Use "/my-passwords list".\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });

        console.log(` Seeing details about an e-mail account:\n ID: ${ID}\n E-mail: ${getEmail.email}\n Password: ${getEmail.password}\n`);
        return Handler.userInputSystem();
    },
    "add": (Args) => {
        const ID = Args[0];
        const EMAIL = Args[1];
        const PASSWORD = Args[2];

        if (!ID) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
        if (!EMAIL) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
        if (!EMAIL.includes('@')) return UI.readlineTimer(5, ' You need to provide a valid e-mail.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
        if (!PASSWORD) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });

        let readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        if (readStorage.emails[ID]) return UI.readlineTimer(5, ' Already exist a e-mail saved with this ID. Try another.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });

        readStorage.emails[ID] = {
            email: EMAIL,
            password: PASSWORD
        };

        Storage.edit('storage.passlock', global.keyBuffer, global.ivBuffer, readStorage);
        return Handler.executeCommand('my-passwords', ['get', ID]);
    },
    "delete": (Args) => {
        const ID = Args[0];
        if (!ID) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });

        let readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        const getEmail = readStorage.emails[ID];
        if (!getEmail) return UI.readlineTimer(5, ' Does not exist any e-mail account saved with this ID. Use "/my-emails list".\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });

        delete readStorage.emails[ID];
        Storage.edit('storage.passlock', global.keyBuffer, global.ivBuffer, readStorage);
        
        return UI.readlineTimer(5, ' That e-mail account was sucessfully deleted!\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
    },
    "generate": (Args) => {
        const ID = Args[0];
        const EMAIL = Args[1];
        const LENGTH = Args[2];
        if (!ID) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
        if (!EMAIL) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
        if (!EMAIL.includes('@')) return UI.readlineTimer(5, ' You need to provide a valid e-mail.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
        if (!LENGTH) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
        if (isNaN(Number(LENGTH))) return UI.readlineTimer(5, ' You need to provide a valid value (1~64).\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
        if (Number(LENGTH) < 1 || Number(LENGTH) > 64) return UI.readlineTimer(5, ' You need to provide a valid value (1~64).\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });

        let readStorage = Storage.read('storage.passlock', global.keyBuffer, global.ivBuffer);
        if (readStorage.emails[ID]) return UI.readlineTimer(5, ' Already exist a e-mail saved with this ID. Try another.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });

        readStorage.emails[ID] = {
            email: EMAIL,
            password: Security.passwordGenerator(Number(LENGTH))
        };

        Storage.edit('storage.passlock', global.keyBuffer, global.ivBuffer, readStorage);

        return Handler.executeCommand('my-emails', ['get', ID]);
    }
}

exports.executable = (Args) => {
    if (!Args[0]) {
        console.log(" " + this.description.detailed_description.replaceAll("\n", "\n ") + "\n");
        return Handler.userInputSystem();
    };

    const getCommand = Args[0];
    Args.shift();

    if (!Object.keys(Commands).includes(getCommand)) return UI.readlineTimer(5, ' Incorrect usage. Use "/help my-emails" for more details.\n You will be redirected to the menu in [TIME] seconds.', () => { return Handler.executeCommand('my-emails') });
    return Commands[getCommand](Args);
}

exports.description = {
    usage: `/my-emails <SubCommand> <Args...>`,
    short_description: `See all "my-emails" subcommands.`,
    detailed_description: "/my-emails list | See all the emails accounts saved.\n/my-emails get [ID] | Get the e-mail saved for the ID.\n/my-emails add [ID] [E-MAIL] [E-MAIL PASSWORD] | Save an email account.\n/my-emails delete [ID] | Delete an email account.\n/my-emails generate [ID] [E-MAIL] [LENGTH 1~64]| Generate a secure password for an account with a specific length.\n\nExample:\n/my-emails add GoogleAccount me@gmail.com 123456789\n/my-emails get GoogleAccount\n/my-emails remove GoogleAccount\n/my-emails generate GoogleAccount me@gmail.com 32"
}