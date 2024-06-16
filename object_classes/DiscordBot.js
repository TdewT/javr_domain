const {spawn} = require('child_process');
const {customLog} = require("../utils/CustomUtils");
const {statuses} = require("./CustomServers");

class DiscordBot {
    constructor({dirPath, lavaArgs, name}) {
        this.status = statuses.OFFLINE;
        this.dirPath = dirPath;
        this.lavaArgs = lavaArgs;
        this.displayName = name;
        this.htmldID = name.replace(' ', '_');
        this.lavaConnected = false;
        this.lavaProcess = null;
        this.botProcess = null;
    }

    start() {
        customLog(this.htmldID, "Bot starting...");

        // Start lavalink before bot
        customLog(this.htmldID, "Launching Lavalink...");
        this.startLava();


        // Start the bot process
        customLog(this.htmldID, "Launching bot...");
        this.startBot();
    }

    startLava() {
        // Start lavalink process
        this.lavaProcess = spawn(
            "java",
            this.lavaArgs,
            {cwd: this.dirPath, shell: true}
        );
        // Start lavalink output handler
        this.lavalinkHandler(this.lavaProcess);
    }

    startBot() {
        // Load project's python
        const pythonPath = `${this.dirPath}\\venv\\scripts\\python.exe`;
        // Start bot process
        this.botProcess = spawn(pythonPath, ['main.py'], {cwd: this.dirPath, shell: true});
        // Start process output handler
        this.discordProcessHandler(this.botProcess);
    }

    discordProcessHandler(discordProcess) {
        // On process output
        discordProcess.stdout.on('data', (data) => {
            data = String(data);
            if (data.includes("online")){
                customLog(this.htmldID, "Bot is now online");
                this.status = statuses.ONLINE;
            }
        });

        this.errorHandler(discordProcess);

    }

    lavalinkHandler(lavaProcess) {
        // On process output
        lavaProcess.stdout.on('data', (data) => {
            data = String(data);
            if (data.includes("Lavalink is ready to accept connections.")) {
                customLog(this.htmldID, "Successfully started lavalink");
                this.lavaConnected = true;
            }
        });
        this.errorHandler(lavaProcess)
    }

    errorHandler(process) {
        process.stderr.on('data', (err) => {
            err = String(err);
            if (!err.includes("on Lavalink with the provided password."))
                customLog(this.htmldID, err);
        });
        process.on('error', (err) => {
            err = String(err);
            customLog(this.htmldID, err);
        });
        process.on('exit', () => {
            this.lavaConnected = false;
            this.lavaProcess = null;
        });
    }
}

module.exports = {DiscordBot};