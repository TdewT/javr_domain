require('module-alias/register');
const {customLog} = require("@/server/utils/custom-utils.cjs");
const {ConfigManager} = require("@/server/utils/config-manager.cjs");
const ServerManager = require("@/server/lib/ServerManager.cjs");
const ServerInstance = require("@/server/lib/ServerInstance.cjs");
const ServerManagerList = require("@/server/lib/ServerManagerList.cjs");
const {serverManagers} = require("@/server/lib/globals.js");
const {ArduinoUtils} = require("@server-lib/Arduino.cjs");

// Name of module used for logs
const logName = "INIT";

// Get configs
customLog(logName, "Loading configs");
ConfigManager.loadConfigs();

// Arduino definitions
const arduinos = {
    1002: {
        name: "Arduino_R4_WIFI",
        baudRate: 9600,
    }
};

// Website definition
const mainName = "JAVR_Domain";
const mainPort = 3002;
const discordBotAutostart = [];
for (const botHtmlID of discordBotAutostart) {
    botHtmlID.replace(' ', '_');
}
const processEnv = 'development';


// Managers initialisation
const serverManagerName = 'JAVR_Server_Manager';
const serverManagerMac = "80:FA:5B:83:12:46";
const serverManagerIP = "192.168.233.52";
const serverManagerPort = 3001;

const serverManagerName2 = 'Test_Server_Manager';
const serverManagerMac2 = "00:D8:61:2F:E2:D7";
const serverManagerIP2 = "192.168.233.50";
const serverManagerPort2 = 3001;

serverManagers.push(new ServerManager({
        serverManagerName: serverManagerName,
        serverManagerMac: serverManagerMac,
        serverManagerIP: serverManagerIP,
        serverManagerPort: serverManagerPort,
    }),
    new ServerManager({
        serverManagerName: serverManagerName2,
        serverManagerMac: serverManagerMac2,
        serverManagerIP: serverManagerIP2,
        serverManagerPort: serverManagerPort2,
    }));

// Website initialisation
const server = new ServerInstance({
    siteName: mainName,
    discordBotAutostart: discordBotAutostart,
    port: mainPort,
    processEnv: processEnv,
});

// Arduino initialisation
ArduinoUtils.initialiseBoards(arduinos);


customLog(logName, "Starting the website server");
server.startWebsite().then(() => {
    customLog(logName, 'Loading Server Managers');
    ServerManagerList.loadServerManagers(ServerInstance.websiteIO);
});
