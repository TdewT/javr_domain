const {spawn} = require('child_process');
const {customLog} = require("../utils/CustomUtils");
const {Statuses} = require("../utils/SharedVars");
const {statusResponse} = require("../utils/SocketEvents");

class DiscordBot {
    constructor({
                    dirPath, name, io,
                    lavaArgs = ["Lavalink.py"],
                    pythonPath = "python"
                }) {
        // Current state of the bot
        this.status = Statuses.OFFLINE;
        // Path to the bots folder
        this.dirPath = dirPath;
        // Path to python installation that is supposed to run bot
        this.pythonPath = pythonPath;
        // Name displayed in clients browser
        this.displayName = name;
        // Name use for identification on both front and backend
        this.htmlID = name.replace(' ', '_');

        // Arguments for lavalink spawn (generally best to leave default)
        this.lavaArgs = lavaArgs;
        // Lavalink status
        this.lavaStatus = Statuses.OFFLINE;
        // Whether it is connected to Discord bot
        this.lavaConnected = false;

        // Stores processes of lavalink and bot itself
        this.lavaProcess = null;
        this.botProcess = null;

        // Pass variables and functions needed for updating client's info
        // FIXME: This is temporary work-around, will fix with general refactor
        this.io = io;
    }

    start() {
        customLog(this.htmlID, "Bot starting...");
        this.updateBotStatus(Statuses.STARTING);

        // Start lavalink before bot (lavalink takes longer to boot up)
        customLog(this.htmlID, "Launching Lavalink...");
        this.startLava();


        // Start the bot process
        customLog(this.htmlID, "Launching bot...");
        this.startBot();
    }

    startLava() {
        // Start lavalink process
        this.lavaProcess = spawn(
            `"${this.pythonPath}"`,
            this.lavaArgs,
            {cwd: this.dirPath, shell: true}
        );
        // Start lavalink output handler
        this.lavalinkHandler();
    }

    startBot() {
        // Start bot process
        this.botProcess = spawn(`"${this.pythonPath}"`, ['main.py'], {cwd: this.dirPath, shell: true});
        // Start process output handler
        this.discordProcessHandler();
    }

    // Handle bots console output
    discordProcessHandler() {
        // On processes output
        this.botProcess.stdout.on('data', (data) => {
            data = String(data);
            // Trigger when the bot reports it's online
            if (data.includes("online")) {
                customLog(this.htmlID, "Bot is now online");
                this.updateBotStatus(Statuses.ONLINE);
            }
        });

        // Start handling errors
        this.errorHandler(this.botProcess);
    }

    // Handle Lavalinks console output
    lavalinkHandler() {
        // On processes output
        this.lavaProcess.stdout.on('data', (data) => {
            data = String(data);
            // Trigger when Lavalink reports it's online
            if (data.includes("Lavalink is ready to accept connections.")) {
                customLog(this.htmlID, "Successfully started lavalink");
                this.updateLavaStatus(Statuses.ONLINE);
            }
            // Trigger when bot connects to lavalink
            else if (data.includes("Connection successfully established")) {
                customLog(this.htmlID, "Lavalink Connected");
                this.lavaConnected = true;
            }
        });

        // Start handling errors
        this.errorHandler(this.lavaProcess)
    }

    // Generalised error handler for both Discord bot and Lavalink
    errorHandler(process) {
        process.stderr.on('data', (err) => {
            err = String(err);
            // Filter out log spam when bot can't connect to lavalink
            if (err.includes("Failed to authenticate Node") && err.includes(`identifier=${this.htmlID},`)) {
                // Update connection state with lavalink
                if (this.lavaConnected){
                    customLog(this.htmlID, "Lavalink Disconnected");
                    this.updateLavaStatus(false)
                }
            }
            else{
                // Log if it's a different error
                customLog(this.htmlID, err);
            }
        });
        // Print out any errors
        process.on('error', (err) => {
            err = String(err);
            customLog(this.htmlID, err);
        });
        // Triggers when application is closed in any way
        process.on('exit', () => {
            // Check which app closed
            if (process === this.lavaProcess) {
                this.lavaStatus = false;
                this.lavaProcess = null;
                customLog(this.htmlID, "Lavalink closed");
            }
            else {
                this.botProcess = null;
                this.updateBotStatus(Statuses.OFFLINE);
                customLog(this.htmlID, "Bot closed");
            }
        });
    }

    stop() {
        if (this.status === Statuses.ONLINE) {
            // Set status to stopping before they stop
            this.updateBotStatus(Statuses.STOPPING);
            this.updateLavaStatus(Statuses.STOPPING);

            // Kill the processes
            // Updates are done by their exit handlers
            if (this.lavaProcess) {
                customLog(this.htmlID, `Stopping Lavalink`);
                this.lavaProcess.kill();
            }
            if (this.botProcess) {
                customLog(this.htmlID, `Stopping Discord bot`);
                this.botProcess.kill();
            }
        }
    }

    // Small helper methods
    updateBotStatus(status) {
        this.status = status;
        statusResponse(this.io)
    }

    updateLavaStatus(status) {
        this.lavaStatus = status;
        statusResponse(this.io)
    }
}

module.exports = {DiscordBot};