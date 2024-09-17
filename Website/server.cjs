require ('module-alias/register');
const {customLog} = require("@/server/utils/custom-utils.cjs");
const {ConfigManager} = require("@/server/utils/config-manager.cjs");
const ServerManager = require("@/server/lib/ServerManager.cjs");
const ServerInstance = require("@/server/lib/ServerInstance.cjs");
const ServerList = require("@/server/lib/ServerList.cjs");
const ServerManagerList = require("@/server/lib/ServerManagerList.cjs");
const {serverManagers} = require("@/server/lib/globals.js");
const DiscordBotList = require("@/server/lib/DiscordBotList.cjs");

const logName = "INIT";

// Get configs
customLog(logName, "Loading configs");
ConfigManager.loadConfigs();

const mainName = "JAVR_Domain";
const mainPort = 3000;
const discordBotAutostart = ['JAVR_Argentino',];
for (const botHtmlID of discordBotAutostart) {
    botHtmlID.replace(' ', '_');
}
const processEnv = 'development';

const serverManagerName = 'JAVR_Server_Manager';
const serverManagerMac = "80:FA:5B:83:12:46";
const serverManagerIP = "localhost";
const serverManagerPort = 3001;


serverManagers.push(new ServerManager({
    serverManagerName: serverManagerName,
    serverManagerMac: serverManagerMac,
    serverManagerIP: serverManagerIP,
    serverManagerPort: serverManagerPort,
}));

const server = new ServerInstance({
    siteName: mainName,
    discordBotAutostart: discordBotAutostart,
    port: mainPort,
    processEnv: processEnv,
});

customLog(logName, 'Loading Server Managers');
ServerManagerList.loadServerManagers(server.websiteIO);
customLog(logName, "Creating server list");
ServerList.init();
customLog(logName, "Creating Discord bots list");
DiscordBotList.init(server.websiteIO);
customLog(logName, "Starting the website server");
server.startWebsite();