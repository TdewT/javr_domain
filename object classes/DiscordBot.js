const {execFile, spawn} = require('child_process');
const {customLog} = require("../utils/CustomUtils");
const {disable} = require("express/lib/application");

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

        //TODO: remove debug
        this.botProcess.on('error', (err) => {
            console.log(err + '');
        })
        this.botProcess.stderr.on('data', (err) => {
            console.log(err + '');
        });
        this.botProcess.stdout.on('data', (data) => {
            console.log(data + '')
        })
    }
}

module.exports = {DiscordBot}