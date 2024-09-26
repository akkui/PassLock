//Carrega as APIs.
const readline = require('readline');

//Carrega os serviços.
const Storage = require('./storage');
const Passlock = require('../passlock/auth');

//Inicializa o readLine.
global.RL = readline.createInterface({ input: process.stdin, output: process.stdout });

function outputLogo(clearConsole) {
    const LOGO_Cache = " ██████   █████  ███████ ███████ ██       ██████   ██████ ██   ██ \n ██   ██ ██   ██ ██      ██      ██      ██    ██ ██      ██  ██  \n ██████  ███████ ███████ ███████ ██      ██    ██ ██      █████   \n ██      ██   ██      ██      ██ ██      ██    ██ ██      ██  ██  \n ██      ██   ██ ███████ ███████ ███████  ██████   ██████ ██   ██";
    
    if (clearConsole) console.clear();
    console.log('\n' + LOGO_Cache + '\n\n PasswordLock, your local privacy-focused password manager.\n');
}

function enterSession(isFirstTime = false) {
    outputLogo(true);

    if (isFirstTime) {
        console.log(" Welcome!\n Seems that it's your first-time running the PassLock!\n")
        console.log(" To start using the app, you first need to define a master password. \n This will be required every time you launch PassLock.\n The master password will be enhanced and used as your password cryptographic keys.\n");
        global.RL.question(' Your master password => ', async (Input) => {
            if (Input === "/datawipe") return readlineTimer(10, ` For security reasons, you can't set "/datawipe" as your master password.\n You will be redirected to the menu in [TIME] seconds.`, () => { enterSession(true) });
            if (Input.replaceAll(" ", "").length < 3) return readlineTimer(10, ` The master password needs to be at least 3 characters long.\n You will be redirected to the menu in [TIME] seconds.`, () => { enterSession(true) });
            Storage.generateCryptographedDatabase(Input);
            return Passlock.auth(Input);
        });
    } else {
        console.log(` Welcome! to access PassLock, you need to provide your master password. \n Unfortunately, it's impossible to recover your data if you have forgotten the master password.\n To wipe all your PassLock data, use "/datawipe".\n`)
        global.RL.question(' Your master password => ', async (Input) => {
            if (Input === "/datawipe") {
                outputLogo(true);
                console.log(` You will clear all your data in PassLock. This action can't be reversed.\n If you are sure you want to wipe all your data, write "confirm".\n If you aren't sure or have changed your mind, write "back".\n`)
                global.RL.question(' Your action => ', async (Input) => {
                    if (Input !== "confirm") return enterSession();
                    return readlineTimer(10, ` [!] All your PassLock data will be wiped in [TIME] seconds.\n You can close the PassLock to cancel that action.`, () => {
                        Storage.datawipe();
                        return enterSession(true);
                    })
                });
            } else {
                return Passlock.auth(Input);
            }
        });
    }
}

exports.load = () => {
    const getSession = Storage.read('session.passlock', 'localkey', 'localiv');
    if (getSession.masterPasswordHash === "") return enterSession(true);
    enterSession();
};

function readlineTimer(TimeInSeconds, Message, Callback) {
    global.RL.pause();
    let i = TimeInSeconds;
    function timerFunction() {
        if (i === 0) { clearInterval(timer); global.RL.resume(); return Callback(); };
        outputLogo(true);
        console.log(Message.replaceAll('[TIME]', i));
        i = i - 1;
    }

    timerFunction();
    const timer = setInterval(() => timerFunction(), 1000);
}

exports.outputLogo = outputLogo;
exports.readlineTimer = readlineTimer;