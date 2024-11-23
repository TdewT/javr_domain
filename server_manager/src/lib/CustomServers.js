const {exec, execFile, spawn} = require('child_process');
const MinecraftStatus = require("minecraft-status");
const {customLog} = require("../utils/custom-utils.js");
const {ConfigManager, configTypes} = require("../lib/ConfigManager");
const {serverTypes, statuses} = require('./globals.js');
const os = require("node:os");
const SocketEvents = require("./SocketEvents.js");
const path = require("node:path");
const treeKill = require("tree-kill");

// Abstracts

/**
 * @desc Abstract base class for all server types.
 */
class ABaseServer {
    /**
     * @param {number} port - Port of the server.
     * @param {string} htmlID - HtmlID, unique name used for identification.
     * @param {string} displayName - Name displayed on the frontend.
     * @param {keyof serverTypes || string} type - Type of the server from statuses.
     */
    constructor({port, htmlID, displayName, type}) {
        // Ensure that this class is abstract
        if (this.constructor === ABaseServer) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.port = port;
        this.htmlID = htmlID;
        this.displayName = displayName;
        this.status = statuses.OFFLINE;
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

/**
 * @desc Abstract class for executable servers.
 */
class AExecutableServer extends ABaseServer {
    /**
     * @param {number} port - Port of the server.
     * @param {string} htmlID - HtmlID, unique name used for identification.
     * @param {string} displayName - Name displayed on the frontend.
     * @param {keyof serverTypes || string} type - Type of the server from statuses.
     * @param {string} [filePath] - Path to the file launching the server.
     * Pass this for servers launch from a single file (for multi-file startup use workingDir with overridden serverStart).
     *
     * @param {string} [workingDir] - Path to the server folder.
     * Pass this for servers that require launching multiple files or specific launch procedure.
     *
     * @param {string[]} [startArgs] - Arguments passed when launching the file.
     * @param {number} startingTime - Maximum time the server can be starting in minutes. After that time has passed
     * server will be considered offline. Has to be enabled with startServer(`true`).
     */
    constructor({
                    port, htmlID, displayName, type,
                    filePath, workingDir, startArgs, startingTime = 2,
                }) {
        super({port, htmlID, displayName, type});

        // Ensure that this class is abstract
        if (this.constructor === ABaseServer) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        // Warning when defining both workingDir and filePath
        if (filePath && workingDir) {
            customLog(this.htmlID, "Both filePath and workingDir are used in parameters, " +
                "unless workingDir is different from file's directory it is recommended to use only one.");
        }

        // For plain runnable files
        if (filePath) {
            this.filePath = filePath;
            this.workingDir = path.dirname(filePath);
        }
        // For servers that have complicated startup
        if (workingDir) {
            this.filePath = workingDir;
            this.workingDir = workingDir;
        }
        this.type = type;
        this.currProcess = null;
        this.startArgs = startArgs;
        this.startingTime = startingTime; // Minutes before server is considered to have failed to start
    }

    /**
     * @desc Start the server.
     * @param {boolean} timeout - Whether to use timeout or process events for offline detection.
     * - `false` = use process events. Default.
     * - `true` = use timeout.
     */
    startServer(timeout = true) {
        customLog(this.htmlID, `Starting server`);
        this.status = statuses.STARTING;


        this.currProcess = execFile(
            this.filePath, this.startArgs,
            {cwd: this.workingDir},
        );


        if (timeout) {
            this.startingTimeout();
        }
        else {
            this.exitCheck(this.currProcess);
        }
    }

    /**
     * @desc Starts a timeout to check if the server is online after `this.startingTime` minutes.
     */
    startingTimeout() {
        setTimeout(() => {
            if (this.status === statuses.STARTING) {
                customLog(this.htmlID, `Server startup timed out, assuming offline`);
                this.status = statuses.OFFLINE;
            }
        }, this.startingTime * 60 * 1000)
    }

    /**
     * @desc Stop the server.
     */
    stopServer() {
        customLog(this.htmlID, `Stopping server`);
        this.status = statuses.STOPPING;
        this.currProcess.kill();
    }

    sendCommand(command) {
        if (this.currProcess !== null) {
            this.currProcess.stdin.write(command + "\n");
        }
        else {
            customLog(this.htmlID, `"${command}" command failed, server process is null`);
        }
    }

    // Check for process exit events
    exitCheck(process) {
        process.on('error', (error) => {
            const errorStr = String(error);
            customLog(this.htmlID, errorStr);
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


// Generic finals

class GenericServer extends ABaseServer {
    constructor({port, htmlID, displayName}) {
        super({port, htmlID, displayName, type: serverTypes.GENERIC});

        this.type = serverTypes.GENERIC;
    }
}

class GenericExecutableServer extends AExecutableServer {
    constructor({
                    port, htmlID, displayName, status,
                    filePath = '', startArgs, startingTime
                }) {
        super({
            port, htmlID, displayName, status, type: serverTypes.GENERIC_EXEC,
            filePath, startArgs, startingTime
        });

        this.type = serverTypes.GENERIC_EXEC;
    }
}

// Specific finals

class MinecraftServer extends AExecutableServer {
    static minecraftJavaVer;

    /**
     * @param {number} port - Port of the server.
     * @param {string} htmlID - HtmlID, unique name used for identification.
     * @param {string} displayName - Name displayed on the frontend.
     * @param {keyof statuses || string} status - Current status of the server.
     * @param {string} workingDir - Path to the server folder.
     * @param {Array<string>} currPlayers - Current list of players connected to the server.
     * @param {number} maxPlayers - Maximum number of players allowed on the server.
     * @param {Array<string>} startArgs - Arguments passed when launching the server.
     * @param {string} minecraftVersion - Version of Minecraft the server is running.
     * @param {number} startingTime - Maximum time the server can be starting in minutes. After that time has passed
     * server will be considered offline. Has to be enabled with startServer(`true`).
     */
    constructor({
                    port, htmlID, displayName,
                    workingDir, startArgs, startingTime,
                    currPlayers = [], maxPlayers = 0, minecraftVersion,
                }) {
        super({
            port, htmlID, displayName, type: serverTypes.MINECRAFT,
            workingDir, startArgs, startingTime
        });

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

    startServer(timeout) {
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
    constructor({
                    port, htmlID, displayName,
                    filePath = '', startArgs, startingTime
                }) {
        super({
            port, htmlID, displayName, type: serverTypes.ARMA,
            filePath, startArgs, startingTime
        });

        this.type = serverTypes.ARMA;
    }
}

class TmodloaderServer extends AExecutableServer {
    constructor({
                    port, htmlID, displayName,
                    workingDir, startArgs, startingTime,
                    configPath, useSteam, lobbyType, currPlayers = [], maxPlayers = 0
                }) {
        super({
            port, htmlID, displayName, type: serverTypes.TMODLOADER,
            workingDir, startArgs, startingTime
        });

        this.type = serverTypes.TMODLOADER;
        this.currPlayers = currPlayers;
        this.maxPlayers = maxPlayers;

        // Setup basic args
        this.startArgs.push("-server", "-start");
        // Add steam lobby mode if steam is enabled
        if (useSteam) this.startArgs.push(`-${lobbyType}`);
        // Add config
        this.startArgs.push(`-config ${configPath}`);
    }

    startServer(timeout = true) {

        if (os.arch() !== "x64") {
            customLog(this.htmlID, "CPU architecture is not supported. x86 (64bit) required");
            return
        }

        // Start the server
        customLog(this.htmlID, "Starting server");
        const launchOptions = {
            cwd: this.workingDir,
            shell: true
        };

        // Spawn the server process
        if (os.platform() !== "linux") {
            // Unix terminal emulator provided by tmodloader
            const busyBox = "LaunchUtils\\busybox64.exe";

            // Start server with busybox emulation
            this.currProcess = spawn(busyBox, ["bash", "./LaunchUtils/ScriptCaller.sh", ...this.startArgs], launchOptions);
        }
        else {
            // Start server
            customLog(this.htmlID, "Launching server on Linux, currently not tested to work.");
            this.currProcess = spawn(`"./LaunchUtils/ScriptCaller.sh"`, this.startArgs, launchOptions);
        }
        this.status = statuses.STARTING;
        this.handleOutput(this.currProcess);
    }

    stopServer() {
        customLog(this.htmlID, "Stopping server");
        // this.sendCommand("1");

        treeKill(this.currProcess.pid, 'SIGTERM', (err) => {
            if (err && this.status !== statuses.OFFLINE) {
                customLog(this.htmlID, `Error stopping server: ${err}`);
            }
            else {
                this.currProcess.kill();
            }
        });
    }


    handleOutput(process) {
        process.stdout.on("data", dataBuff => {
            const data = String(dataBuff).trim();
            // console.log(data);
            // Add player who joined
            if (data.includes("has joined")) this.addPlayer(this.getPlayerName(data));
            // Remove player
            if (data.includes("has left")) this.removePlayer(this.getPlayerName(data));
        });
        // process.stderr.on("data", dataBuff => {
        //     const data = String(dataBuff).trim();
        //     console.log(data);
        // });

        this.exitCheck(this.currProcess);
    }

    addPlayer(name) {
        this.currPlayers.push(name);
        SocketEvents.statusResponse();
    }

    removePlayer(name) {
        this.currPlayers = this.currPlayers.filter(player => player !== name);
        SocketEvents.statusResponse();
    }


    getPlayerName(str) {
        const toRemove = ['has joined.', 'has left.'];
        toRemove.forEach(strToRemove => str = str.replace(strToRemove, ""));

        return str;
    }

    // Check for process exit events
    exitCheck(process) {
        process.on('error', (error) => {
            const errorStr = String(error).trim();
            customLog(this.htmlID, errorStr);
            this.status = statuses.OFFLINE;
        });

        process.on('exit', () => {
            customLog(this.htmlID, `Server process ended`);
            this.status = statuses.OFFLINE;
        })
    }
}

class TeamspeakServer extends AExecutableServer {
    constructor({
                    port, htmlID, displayName,
                    filePath = '', startingTime
                }) {
        super({
            port, htmlID, displayName, type: serverTypes.TSSERVER,
            filePath, startingTime
        });

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