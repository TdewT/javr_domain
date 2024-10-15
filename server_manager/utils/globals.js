/**
 * @desc List of servers from Server Manager
 * @type {ABaseServer[]}
 */
let servers = [];
const statuses = {
    "ONLINE": "online", "STARTING": "starting", "BUSY": "busy", "STOPPING": "stopping", "OFFLINE": "offline",
};
const serverTypes = {
    GENERIC: "generic",
    GENERIC_EXEC: "generic_exec",
    MINECRAFT: "minecraft",
    ARMA: "arma",
    TSSERVER: "tsserver",
    TMODLOADER: "tmodloader"
};
const Events = {
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
    ARDUINO_MODIFY_LIGHT: 'arduino_modify_light',
};

module.exports = {
    servers,
    statuses,
    serverTypes,
    Events
};