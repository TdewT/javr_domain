const {exec, execFile, spawn} = require('child_process');
const CustomUtils = require('../utils/custom-utils.js');
const MinecraftStatus = require("minecraft-status");
const {customLog} = require("../utils/custom-utils.js");
const {ConfigManager, configTypes} = require("../lib/ConfigManager");
const {serverTypes, statuses} = require('./globals.js');
const os = require("node:os");
const SocketEvents = require("./SocketEvents.js");
const path = require("node:path");
const psTree = require("ps-tree");

class ABaseServer {
    constructor({port, htmlID, displayName, status = statuses.OFFLINE, type}) {
        // Ensure that this class is abstract
        if (this.constructor === ABaseServer) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.port = port;
        this.htmlID = htmlID;
        this.displayName = displayName;
        this.status = status;
        this.type = type;
    }

    // Run check periodically to see if the server is still up
    lastStatus = statuses.OFFLINE;
    updateStatus() {

        // Check what os is on the machine
        let command;
        if (os.platform() === 'win32') {
            // Windows command
            command = `netstat -an | find ":${this.port}"`;
        }
        else {
            // Linux command
            command = `netstat -tuln | grep ":${this.port}"`;
        }

        // Check if port is taken
        exec(command, (error, stdout, stderr) => {
            if (stderr) {
                customLog(this.htmlID, `netstat failed: ${stderr}`);
            }
            if (stdout !== "") {
                if (stdout.includes("LISTENING") || stdout.includes("*:*"))
                    this.status = statuses.ONLINE;
                else {
                    if (this.status !== statuses.STARTING)
                        this.status = statuses.OFFLINE;
                }
            }
            else {
                if (this.status !== statuses.STARTING)
                    this.status = statuses.OFFLINE;
            }
        })
    }

    statusMonitor() {
        setInterval(() => {
            if (this.lastStatus !== this.status) {
                customLog(this.htmlID, `Status changed to "${this.status}"`);
                SocketEvents.statusResponse();
            }
            this.lastStatus = this.status;
            this.updateStatus()
        }, 1000);
    }
}

class AExecutableServer extends ABaseServer {
    constructor({port, htmlID, displayName, filePath = '', status, type, startArgs, offlineTimer: startingTime = 2}) {
        super({port, htmlID, displayName, status, type});

        // Ensure that this class is abstract
        if (this.constructor === ABaseServer) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.filePath =  filePath;
        this.workingDirectory = path.dirname(filePath); // Get the directory of the file
        this.type = type;
        this.currProcess = null;
        this.startArgs = startArgs;
        this.startingTime = startingTime; // Timeout in minutes after which the server should be online
    }

    startServer() {
        customLog(this.htmlID, `Starting server`);
        this.status = statuses.STARTING;


        this.currProcess = execFile(
            this.filePath, this.startArgs,
            {cwd: this.workingDirectory},
        );


        // Check for process exit
        this.exitCheck(this.currProcess);

        setTimeout(()=>{
            if (this.status === statuses.STARTING)
                this.status = statuses.OFFLINE;
        }, this.startingTime * 60 * 1000)
    }

    stopServer() {
        customLog(this.htmlID, `Stopping server`);
        this.status = statuses.STOPPING;
        this.currProcess.kill();
    }

    // For servers with executable linked
    exitCheck(process) {
        process.on('error', (error) => {
            String(error);
            customLog(this.htmlID, error);
            this.status = statuses.OFFLINE;
        });

        process.stderr.on('data', (err) => {
            customLog(this.htmlID, err)
        });

        process.on('exit', () => {
            customLog(this.htmlID, `Server process ended`);
            this.status = statuses.OFFLINE;
        })
    }
}

class GenericServer extends ABaseServer {
    constructor({port, htmlID, displayName, status = statuses.OFFLINE,}) {
        const type = serverTypes.GENERIC;
        super({port, htmlID, displayName, status, type});
    }
}

class GenericExecutableServer extends AExecutableServer {
    constructor({port, htmlID, displayName, filePath = '', startArgs,}) {
        super({port, htmlID, displayName, filePath, startArgs});

        this.type = serverTypes.GENERIC_EXEC;
    }
}

class MinecraftServer extends AExecutableServer {
    static minecraftJavaVer;

    constructor({
                    port, htmlID, displayName, path = '',
                    workingDir,
                    currPlayers = [],
                    maxPlayers = 0,
                    startArgs = [],
                    minecraftVersion
                }) {
        super({port, htmlID, displayName, path, startArgs});

        this.workingDir = workingDir;
        this.type = serverTypes.MINECRAFT;
        this.currPlayers = currPlayers;
        this.maxPlayers = maxPlayers;
        this.minecraftVersion = minecraftVersion;
        this.failedQuery = 0;
        MinecraftServer.minecraftJavaVer = ConfigManager.getConfig(configTypes.minecraftJavaVer);

        // This will be compared against to determine when the status has to be updated on client
        this.lastStatus = this.status;
        this.lastPlayers = this.currPlayers;
    }


    statusMonitor() {
        setInterval(() => {
            if (this.lastStatus !== this.status) {
                customLog(this.htmlID, `Status changed to "${this.status}"`);
                SocketEvents.statusResponse();
            }
            if (this.currPlayers.length !== this.lastPlayers.length) {
                customLog(this.htmlID, `Player Count update sent"`);
                SocketEvents.statusResponse();
            }
            this.lastPlayers = this.currPlayers;
            this.lastStatus = this.status;
            this.updateStatus()
        }, 1000);
    }

    // Check if port is busy, update server status
    updateStatus() {
        this.updateServerInfo()
    }

    startServer() {
        customLog(this.htmlID, `Starting server`);
        this.status = statuses.STARTING;

        // Check if minecraft version has java attached
        if (!MinecraftServer.minecraftJavaVer[this.minecraftVersion]) {
            // If the version is not listed use default
            this.currProcess = spawn(
                "java",
                this.startArgs,
                {cwd: this.workingDir}
            );
        }
        else {
            // If the version is listed use specified java version
            this.currProcess = spawn(
                MinecraftServer.minecraftJavaVer[this.minecraftVersion],
                this.startArgs,
                {cwd: this.workingDir}
            );
        }

        // Check for process exit
        this.exitCheck(this.currProcess);

        this.currProcess.stdout.on('data', (data) => {
            // Convert output to string
            let output = data + '';

            // Get maxPlayers when server starts (regex to see when server is done launching)
            if (/INFO]: Done \(.*\)! for help, type "help" or "\?"/.test(output)) {
                this.updateServerInfo();

                // Send updated servers to client
                SocketEvents.statusResponse();
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
                this.failedQuery = 0;
                if (this.status !== statuses.STOPPING) {
                    // Set server status to online
                    this.status = statuses.ONLINE;
                    // Update values
                    this.currPlayers = response.players.sample;
                    this.maxPlayers = response.players.max;
                }
            })
            // If query failed
            .catch(() => {
                // If after going online server fails to answer query 10 times assume it's offline
                if (this.status !== statuses.STARTING) {
                    this.failedQuery += 1;
                    if (this.failedQuery > 10) {
                        this.status = statuses.OFFLINE;
                        this.currPlayers = [];
                    }
                }
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
        if (this.status === statuses.ONLINE) {
            this.status = statuses.STOPPING;
            this.sendCommand('stop');
            this.currPlayers = [];

            setTimeout(() => {

                if (this.status === statuses.STOPPING) {
                    customLog(this.htmlID, `Server not online, forcing automated exit`);
                    if (this.currProcess !== null) {
                        this.currProcess.kill();
                        this.currPlayers = [];
                    }
                    else {
                        customLog(this.htmlID, `Cannot stop, server not attached to this process`);
                    }
                }

            }, 120_000)


        }
        else {
            customLog(this.htmlID, `Server not online, forcing manual exit`);
            if (this.currProcess !== null) {
                this.currProcess.kill();
                this.currPlayers = [];
            }
            else {
                customLog(this.htmlID, `Cannot stop, server not attached to this process`);
            }
        }
    }

    // If you need to compare versions e.g. currVersion > targetVersion
    // Useful when determining java version that server should run on
    // Currently not in use
    versionToNumber() {
        let versionInt = this.minecraftVersion.replace(/\./, '');
        return Number(versionInt)
    }
}

class ArmaServer extends AExecutableServer {
    constructor({port, htmlID, displayName, filePath = '', startArgs,}) {
        super({port, htmlID, displayName, filePath, startArgs});

        this.type = serverTypes.ARMA;
    }
}

class TmodloaderServer extends AExecutableServer {
    constructor({port, htmlID, displayName, filePath = '', startArgs,}) {
        super({port, htmlID, displayName, filePath, startArgs});

        this.type = serverTypes.TMODLOADER;
    }

    startServer() {
        customLog(this.htmlID, `Starting server`);
        this.status = statuses.STARTING;

        this.currProcess = spawn(
            this.filePath, this.startArgs,
            {cwd: this.workingDirectory, shell: true},
        );

        psTree(this.currProcess.pid, (err, children) => {
            if (err) console.log(err);
            console.log(children);
            this.currProcess = children[0].pid;
        });

        this.currProcess.stdout.on('data', (data) => {
            String(data);
            console.log(data)
        });
    }
}

class TeamspeakServer extends AExecutableServer {
    constructor({port, htmlID, displayName, filePath = ''}) {
        super({port, htmlID, displayName, filePath});

        this.type = serverTypes.TSSERVER;
    }
}


const serverClasses = {
    "generic": GenericServer,
    "generic_exec": GenericExecutableServer,
    "minecraft": MinecraftServer,
    "arma": ArmaServer,
    "tsserver": TeamspeakServer,
    "tmodloader": TmodloaderServer
};

module.exports = {
    AExecutableServer,
    statuses,
    serverClasses,
    serverTypes
};