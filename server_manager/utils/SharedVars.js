/**
 * @desc List of servers from Server Manager
 * @type {ABaseServer[]}
 */
let servers = [];
const statuses = {
    "ONLINE": "online", "STARTING": "starting", "BUSY": "busy", "STOPPING": "stopping", "OFFLINE": "offline",
};
const serverTypes = {
    "GENERIC": "generic",
    "GENERIC_EXEC": "generic_exec",
    "MINECRAFT": "minecraft",
    "ARMA": "arma",
    "TSSERVER": "tsserver",
    "TMODLOADER": "tmodloader"
};

module.exports = {
    servers,
    statuses,
    serverTypes
};