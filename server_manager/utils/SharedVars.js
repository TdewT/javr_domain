// List of servers from Server Manager
let servers = [];
const statuses = {
    "ONLINE": "online", "STARTING": "starting", "BUSY": "busy", "STOPPING": "stopping", "OFFLINE": "offline",
};
const serverTypes = {
    "GENERIC": "generic",
    "MINECRAFT": "minecraft",
    "ARMA": "arma",
    "TSSERVER": "tsserver"
};

module.exports = {
    servers,
    statuses,
    serverTypes
};