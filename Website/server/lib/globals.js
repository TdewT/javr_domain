const Statuses = {
    "ONLINE": "online", "STARTING": "starting", "BUSY": "busy", "STOPPING": "stopping", "OFFLINE": "offline",
};
const StatusIndicators = {
    "online": "🟢", "starting": "🟡", "busy": "🟡", "stopping": "🟡", "offline": "🔴",
};
const statusDisplayNames = {
    "online": "Online", "starting": "Starting...", "busy": "Port busy", "stopping": "Stoping...", "offline": "Offline",
};
const ServerTypes = {
    "GENERIC": "generic",
    "MINECRAFT": "minecraft",
    "ARMA": "arma",
    "TSSERVER": "tsserver"
};
const ServiceTypes = {
    SERVER: "server",
    DISCORD_BOT: "discordBot",
    SERVER_MANAGER: "serverManager",
};
const events = {
    INFO: "info",
    STATUS_RESPONSE: 'status_response',
    STATUS_REQUEST: 'status_request',
    ZT_RESPONSE: "zt_response",
    ZT_REQUEST: "zt_request",
    ZT_SEND_FORM: 'zt_send_form',
    REQUEST_FAILED: 'request_failed',
    START_SERVER_REQUEST: 'start_server_request',
    STOP_SERVER_REQUEST: 'stop_server_request',
    START_SERVER_MANAGER_REQUEST: 'start_server_manager_request',
    STOP_SERVER_MANAGER_REQUEST: 'stop_server_manager_request',
    START_DBOT_REQUEST: 'start_dbot_request',
    STOP_DBOT_REQUEST: 'stop_dbot_request',
    CONNECTION: 'connection',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
};

// Arduino arrays
let arduinoBoards = [];

// Discord bots arrays
let discordBotsWithHosts = {};
let discordBots = [];

// Servers arrays
let serversWithHosts = {};
let serverList = [];

// Server managers
let serverManagers = [];

module.exports = {
    Statuses,
    StatusIndicators,
    events,
    ServiceTypes,
    discordBots,
    discordBotsWithHosts,
    serversWithHosts,
    serverList,
    serverManagers,
    ServerTypes,
    arduinoBoards,
};