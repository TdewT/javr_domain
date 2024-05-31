const {spawn} = require('child_process');
const {customLog} = require("../utils/CustomUtils");

class DiscordBot {
    constructor({dirPath, lavaArgs, name}) {
        this.dirPath = dirPath;
        this.lavaArgs = lavaArgs;
        this.displayName = name;
        this.htmldID = name.replace(' ', '_');
        this.lavaProcess = null;
        this.botProcess = null;
    }

    start() {
        customLog(this.htmldID, "Bot starting...")

        // Load projects python
        const pythonPath = `${this.dirPath}\\venv\\scripts\\python.exe`


        // Start lavalink before bot
        customLog(this.htmldID, "Launching Lavalink...")
        this.lavaProcess = spawn(
            "java",
            this.lavaArgs,
            {cwd: this.dirPath, shell: true}
        );

        // Start the bot process
        customLog(this.htmldID, "Launching bot...")
        this.botProcess = spawn(pythonPath, ['main.py'], {cwd: this.dirPath});

    }
}

module.exports = {DiscordBot}