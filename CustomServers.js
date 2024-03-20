const exec = require('child_process').exec;
const statuses = {
    "ONLINE": "🟢", "LAUNCHING": "🟡", "OFFLINE": "🔴",
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
    updateStatus() {
        exec(`netstat -an | find "${this.port}"`, (error, stdout, stderr) => {
            if (stderr){
                console.log(stderr)
            }
            if (stdout !== "") {
                this.status = statuses.ONLINE;
            }
            else {
                if (this.status !== statuses.LAUNCHING)
                    this.status = statuses.OFFLINE;
            }
        })
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