//Carrega os serviços.
const Storage = require('./services/storage.js');
const UI = require('./services/userinterface.js');

//Executa de fato os serviços.
Storage.load();
UI.load();