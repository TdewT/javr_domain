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
const Events = {
    // Global
    INFO: "info",
    REQUEST_FAILED: 'request_failed',
    CONNECTION: 'connection',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    // Services
    STATUS_RESPONSE: 'status_response',
    STATUS_REQUEST: 'status_request',
    START_SERVER_REQUEST: 'start_server_request',
    STOP_SERVER_REQUEST: 'stop_server_request',
    START_SERVER_MANAGER_REQUEST: 'start_server_manager_request',
    STOP_SERVER_MANAGER_REQUEST: 'stop_server_manager_request',
    START_DBOT_REQUEST: 'start_dbot_request',
    STOP_DBOT_REQUEST: 'stop_dbot_request',
    // Terra Metrics
    ARDUINO_MODIFY_LIGHT: 'arduino_modify_light',
    // ZeroTier
    ZT_RESPONSE: "zt_response",
    ZT_REQUEST: "zt_request",
    ZT_SEND_FORM: 'zt_send_form',
    ZT_REQUEST_FAILED: 'zt_request_failed',
    // Game Picker
    GAME_CARDS_UPDATE: 'game_cards_update',
    USERS_GAME_CARDS_UPDATE: 'users_game_cards_update',
    GAME_CARDS_REQUEST: 'game_cards_request',
    USERS_GAME_CARDS_REQUEST: 'users_game_cards_request',
    GAME_CARDS_RESPONSE: 'game_cards_response',
    USERS_GAME_CARDS_RESPONSE: 'users_game_cards_response',
    USER_GAME_CARDS_RESPONSE: 'user_game_cards_response',
    GAME_CARDS_RESULTS: 'game_cards_results',
};
const ArduinoEvents = {
    CONNECT: "connect",
    MESSAGE_END: "message-end",
    STATUS_UPDATE: "status-update",
    TIME_UPDATE_REQUEST: "time-update-request",
    TIME_UPDATE_RESPONSE: "time-update-response",
    MODIFY_LIGHT: "modify-light",
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

// GameCards
let allUsersGameCards = {};
let gameCards = [];

// Socket IO for website to user comms
let websiteIO;
function getWebsiteIO() {
    return websiteIO;
}
function setWebsiteIO(socket) {
    websiteIO = socket;
}

// Dict with rules
const defaultRules = {
    "allowTerrariumLedOverride": false,
    "displayTerrariumCam": false
};

module.exports = {
    setWebsiteIO,
    getWebsiteIO,
    Statuses,
    StatusIndicators,
    Events,
    ServiceTypes,
    discordBots,
    discordBotsWithHosts,
    serversWithHosts,
    serverList,
    serverManagers,
    ServerTypes,
    arduinoBoards,
    gameCards,
    allUsersGameCards,
    ArduinoEvents,
    defaultRules
};