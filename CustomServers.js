const tcpPortUsed = require("tcp-port-used");
const statuses = {
    "ONLINE": "🟢", "CONNECTION_ERROR": "🟡", "OFFLINE": "🔴",
}

class CustomServer {
    port = -1;
    htmlID = 'No name given';
    displayName = 'no-name';
    status = statuses.OFFLINE;
    host = 'localhost'

    constructor(port, htmlID, displayName, status = statuses.OFFLINE, host = 'localhost') {
        this.port = port;
        this.htmlID = htmlID;
        this.displayName = displayName;
        this.status = status;
        this.host = host
    }

    // Check if port is being used
    updateStatus(sendFunc) {
        tcpPortUsed.check(this.port, 'localhost')
            .then((inUse) => {
                if (inUse) {
                    // If status has changed update class value and send info to clients
                    this.status = statuses.ONLINE;
                }
                else {
                    // If status has changed update class value and send info to clients
                    this.status = statuses.OFFLINE;
                }
            }, function (err) {
                console.error('Error on check:', err.message);
            });
    }

    // Run check periodically to see if the server is still up
    lastStatus = statuses.OFFLINE
    portChecker(emitFunc, socket, servers) {
        setInterval(() => {
            if (this.lastStatus !== this.status) {
                console.log("Updating status for:", this.htmlID);
                emitFunc(socket, servers);
            }
            this.lastStatus = this.status;
            this.updateStatus()
        }, 1000);
    }
}


module.exports = {
    CustomServer,
    statuses
}