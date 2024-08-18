// List of servers from Server Manager
let servers = [];
const statuses = {
    "ONLINE": "online", "STARTING": "starting", "BUSY": "busy", "STOPPING": "stopping", "OFFLINE": "offline",
};

module.exports = {
    servers,
    statuses
};