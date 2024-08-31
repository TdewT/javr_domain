// Local imports
const {customLog} = require('./utils/CustomUtils');
const {ConfigManager} = require("./utils/ConfigManager");
const MainWebsite = require('./object_classes/MainWebsite');
const {ServerList} = require("./object_classes/ServerList");
const ServerManager = require("./object_classes/ServerManager");
let {serverManagers, ServerManagerList} = require("./object_classes/ServerManagerList");

const logName  = "INIT";

// Get configs
customLog(logName, "Loading configs");
ConfigManager.loadConfigs();

const mainName = "JAVR_Domain";
const mainPort = 3000;

const serverManagerName = 'JAVR_Server_Manager';
const serverManagerMac = "80:FA:5B:83:12:46";
const serverManagerIP = "localhost";
const serverManagerPort = 3001;


serverManagers.push(new ServerManager({
    serverManagerName: serverManagerName,
    serverManagerMac: serverManagerMac,
    serverManagerIP:serverManagerIP,
    serverManagerPort: serverManagerPort,
}));

const website = new MainWebsite({
    siteName: mainName,
    port: mainPort
});

customLog(logName, "Starting main website");
website.startWebsite();
customLog(logName, 'Loading Server Managers');
ServerManagerList.startServerManagers(website.websiteIO);
customLog(logName, "Creating server list");
ServerList.init();




