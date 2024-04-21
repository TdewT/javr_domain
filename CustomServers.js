const {exec, execFile, spawn} = require('child_process');
const CustomUtils = require('./CustomUtils');
const minecraft_java_ver = require('../JAVR_configs/minecraft_java_ver');
const MinecraftStatus = require("minecraft-status");
const {customLog} = require("./CustomUtils");
const statuses = {
    "ONLINE": "online", "STARTING": "starting", "BUSY": "busy", "OFFLINE": "offline",
};
const types = {
    "GENERIC": "generic",
    "MINECRAFT": "minecraft",
    "ARMA": "arma",
    "TSSERVER": "tsserver"
};

class GenericServer {
    constructor({
                    port,
                    htmlID,
                    displayName,
                    path = '',
                    status = statuses.OFFLINE,
                    type = types.GENERIC,
                }) {
        this.port = port;
        this.htmlID = htmlID;
        this.displayName = displayName;
        this.status = status;
        this.path = path;
        this.type = type;
    }

    // Check if port is being used
    updateStatus() {
        exec(`netstat -an | find "${this.port}"`, (error, stdout, stderr) => {
            if (stderr) {
                customLog(this.htmlID, `netstat failed: ${stderr}`)
            }
            if (stdout !== "") {
                if (!stdout.includes("WAIT"))
                    this.status = statuses.ONLINE;
                else {
                    this.status = statuses.OFFLINE;
                }
            }
            else {
                if (this.status !== statuses.STARTING)
                    this.status = statuses.OFFLINE;
            }
        })
    }

    // Run check periodically to see if the server is still up
    lastStatus = statuses.OFFLINE;

    statusMonitor(emitFunc, socket, event, servers) {
        setInterval(() => {
            if (this.lastStatus !== this.status) {
                customLog(this.htmlID, `Status changed to "${this.status}"`);
                emitFunc(socket, event, servers);
            }
            this.lastStatus = this.status;
            this.updateStatus()
        }, 500);
    }

    // For servers with executable linked
    exitCheck(server) {
        server.currProcess.on('error', (error) => {
            customLog(server.htmlID, error);
            server.status = statuses.OFFLINE;

        });

        server.currProcess.stderr.on('data', (err) => {
            customLog(server.htmlID, err)
        });

        server.currProcess.on('exit', () => {
            customLog(server.htmlID, `Server process ended`);
            server.status = statuses.OFFLINE;
        })
    }
}

class MinecraftServer extends GenericServer {
    constructor({
                    port, htmlID, displayName, path = '', status = statuses.OFFLINE,
                    currProcess = null,
                    currPlayers = [],
                    maxPlayers = 0,
                    startArgs = ["-jar", "minecraft_server.1.12.2.jar", "nogui"],
                    minecraftVersion
                }) {
        super({port, htmlID, displayName, path, status});

        this.type = types.MINECRAFT;
        this.currProcess = currProcess;
        this.currPlayers = currPlayers;
        this.maxPlayers = maxPlayers;
        this.startArgs = startArgs;
        this.minecraftVersion = minecraftVersion;
    }

    // Run check periodically to see if the server is still up
    lastStatus = statuses.OFFLINE;
    lastPlayers = this.currPlayers;

    statusMonitor(emitFunc, socket, event, servers) {
        setInterval(() => {
            if (this.lastStatus !== this.status) {
                customLog(this.htmlID, `Status changed to "${this.status}"`);
                emitFunc(socket, event, servers);
            }
            if (this.currPlayers !== this.lastPlayers){
                emitFunc(socket, event, servers)
            }
            this.lastPlayers = this.currPlayers;
            this.lastStatus = this.status;
            this.updateStatus()
        }, 500);
    }

    // Check if port is busy, update server status
    updateStatus() {
        this.updateServerInfo()
    }

    startServer(emitFunc, socket, servers) {
        customLog(this.htmlID, `Starting server`);
        this.status = statuses.STARTING;

        // Check if minecraft version has java attached
        if (!minecraft_java_ver[this.minecraftVersion]) {
            // If the version is not listed use default
            this.currProcess = spawn(
                "java",
                this.startArgs,
                {cwd: this.path}
            );
        }
        else {
            // If the version is listed use specified java version
            this.currProcess = spawn(
                minecraft_java_ver[this.minecraftVersion],
                this.startArgs,
                {cwd: this.path}
            );
        }

        // Check for process exit
        this.exitCheck(this);

        this.currProcess.stdout.on('data', (data) => {
            // Convert output to string
            let output = data + '';

            // Get maxPlayers when server starts (regex to see when server is done launching)
            if (/INFO]: Done \(.*\)! for help, type "help" or "\?"/.test(output)) {
                this.updateServerInfo();

                // Send updated servers to client
                emitFunc(socket, "status_response", servers);
            }

            // Player join event
            if (output.includes("joined the game")) {
                // Update server with new info
                this.updateServerInfo();
            }
            // Player left event
            if (output.includes("left the game")) {
                // Update server with new info
                this.updateServerInfo();
            }
        })


    }

    updateServerInfo() {
        // Query server for info
        MinecraftStatus.MinecraftQuery.fullQuery("localhost", this.port, 500)
            // If query successful
            .then(response => {
                // Set server status to online
                this.status = statuses.ONLINE;
                // Update values
                this.currPlayers = response.players.sample;
                this.maxPlayers = response.players.max;
            })
            // If query failed
            .catch(() => {
                // If server is not starting then it means it's offline
                if (this.status !== statuses.STARTING)
                    this.status = statuses.OFFLINE;
            })
    }

    sendCommand(command) {
        if (this.currProcess !== null) {
            this.currProcess.stdin.write(command + "\n");
        }
        else {
            customLog(this.htmlID, `"${command}" command failed, server process is null`);
        }
    }

    stopServer() {
        customLog(this.htmlID, `Stopping server`);
        this.sendCommand('stop');
    }

    // If you need to compare versions e.g. currVersion > targetVersion
    // Useful for instance, for determining java version that server should run on
    // Currently not in use
    versionToNumber(){
        let versionInt = this.minecraftVersion.replace(/\./, '');
        return Number(versionInt)
    }
}

class ArmaServer extends GenericServer {
    constructor({
                    port, htmlID, displayName, path = '', status = statuses.OFFLINE,
                    startArgs, currProcess = null,
                }) {
        super({port, htmlID, displayName, path, status});

        this.type = types.ARMA;
        this.startArgs = startArgs;
        this.currProcess = currProcess;
    }

    startServer() {
        customLog(this.htmlID, `Starting server`);
        this.status = statuses.STARTING;

        this.currProcess = execFile(
            this.path,
            [this.startArgs]
        );

        // Check for process exit
        this.exitCheck(this);

    }

    stopServer() {
        customLog(this.htmlID, `Stopping server`);
        this.currProcess.kill();
    }
}

class TeamspeakServer extends GenericServer {
    constructor({
                    port, htmlID, displayName, path = '', status = statuses.OFFLINE,
                    startArgs, currProcess = null,
                }) {
        super({port, htmlID, displayName, path, status});

        this.type = types.TSSERVER;
        this.startArgs = startArgs;
        this.currProcess = currProcess;
    }

    startServer() {
        customLog(this.htmlID, `Starting server`);
        this.status = statuses.STARTING;

        this.currProcess = execFile(
            this.path,
            [this.startArgs]
        );

        // Check for process exit
        this.exitCheck(this);

    }

    stopServer() {
        customLog(this.htmlID, `Stopping server`);
        if (this.currProcess) {
            // This does not kill the server process, just the one starting the server
            this.currProcess.kill();
        }

        this.killServer();
    }

    killServer() {
        // Search for the process
        exec('tasklist | find "ts3server.exe"', (error, stdout, stderr) => {
            if (error) {
                customLog(this.htmlID, `${error}`);
            }
            if (stderr) {
                customLog(this.htmlID, `${stderr}`);
            }
            if (stdout !== "") {
                // Get cmd output
                let tasklistRes = stdout + '';

                // Replace multiple spaces with single spaces
                tasklistRes = CustomUtils.removeDuplicateSpace(tasklistRes);

                // Split by space and call killTask function
                CustomUtils.killTask(this.htmlID, tasklistRes.split(' ')[1]);
            }
            else {
                customLog(this.htmlID, `No server process found`);
            }
        })
    }
}

module.exports = {
    ArmaServer,
    GenericServer,
    MinecraftServer,
    TeamspeakServer,
    statuses,
    types
};