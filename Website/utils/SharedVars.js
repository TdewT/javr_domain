let discordBots = [];
let serverManagers = [];

/**
 * @enum Statuses
 * @property {string} ONLINE
 * @property {string} STARTING
 * @property {string} BUSY
 * @property {string} STOPPING
 * @property {string} OFFLINE
 */
const Statuses = {
    "ONLINE": "online", "STARTING": "starting", "BUSY": "busy", "STOPPING": "stopping", "OFFLINE": "offline",
};

module.exports = {
    Statuses,
    discordBots,
    serverManagers
};