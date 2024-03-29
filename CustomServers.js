const exec = require('child_process').exec;
const statuses = {
    "ONLINE": "🟢", "STARTING": "🟡", "OFFLINE": "🔴",
}

class CustomServer {
    constructor(port, htmlID, displayName, path = '', status = statuses.OFFLINE, host = 'localhost'){
        this.port = port;
        this.htmlID = htmlID;
        this.displayName = displayName;
        this.status = status;
        this.path = path
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
                if (this.status !== statuses.STARTING)
                    this.status = statuses.OFFLINE;
            }
        })
    }

    // Run check periodically to see if the server is still up
    lastStatus = statuses.OFFLINE

    portChecker(emitFunc, socket, event, servers) {
        setInterval(() => {
            if (this.lastStatus !== this.status) {
                console.log("Updating status for:", this.htmlID);
                emitFunc(socket, event, servers);
            }
            this.lastStatus = this.status;
            this.updateStatus()
        }, 1000);
    }
}


class MinecraftServer extends CustomServer {
    constructor(port, htmlID, displayName, status = statuses.OFFLINE, path = '', host = 'localhost',
                currProcess = null,
                currPlayers = [],
                maxPlayers = 0,
                startArgs = ["-jar", "minecraft_server.1.12.2.jar", "nogui"]){
        super(port, htmlID, displayName, status, host, path);

        this.currProcess = currProcess;
        this.currPlayers = currPlayers;
        this.maxPlayers = maxPlayers;
        this.startArgs = startArgs
    }

    startServer(emitFunc, socket, servers) {
        const child_process = require('child_process');

        this.currProcess = child_process.spawn(
            "java",
            this.startArgs,
            {cwd: this.path}
        );

        this.currProcess.on('error', function (error) {
            console.error(error)
        });

        this.currProcess.stderr.on('data', function (data) {
            console.log(data)
        });

        // Check player count after servers starts
        let firstCheck = true;
        // Send list command to get player count when first launched (required to get maxPlayers)
        this.sendCommand('list')

        // Server output stream
        this.currProcess.stdout.on('data', (data) =>{
            // Convert output to string
            let output = data+'';

            // Get maxPlayers when server starts
            if (firstCheck && output.includes("players online")){
                // Remove unnecessary information
                const pureMsg = output.split(':')[3]
                // Split current and max player
                const playerNumbers = pureMsg.split('/')
                // Filter out whatever is not a number
                this.maxPlayers = this.extractNums(playerNumbers[1])
                // Set flag so this only runs once
                firstCheck = false;

                // Send updated servers to client
                emitFunc(socket, "status_response", servers);
            }

            // Add player to current players
            if (output.includes("joined the game")){
                this.currPlayers.push(this.getPlayerName(output));

                // Send updated servers to client
                emitFunc(socket, "status_response", servers);
            }
            // Remove player from current players
            if (output.includes("left the game")){
                const index = this.currPlayers.indexOf(this.getPlayerName(output))
                this.currPlayers.splice(index, this.currPlayers.length)

                // Send updated servers to client
                emitFunc(socket, "status_response", servers);
            }
        })
    }

    sendCommand(command) {
        if (this.currProcess !== null){
            this.currProcess.stdin.write(command + " \n");
        }
        else{
            console.log("Command failed: server process is null");
        }
    }

    stopServer(){
        this.sendCommand('stop');
    }

    extractNums(str){
        let res = '';
        for (const char of str) {
            if (char >= '0' && char <= '9') {
                res += char;
            }
        }
        return Number(res)
    }

    getPlayerName(outputStr){
        // Remove unnecessary information
        const filtered = outputStr.split(':')[3]
        // Return player's name
        return filtered.split(' ')[1];
    }
}

module.exports = {
    CustomServer,
    MinecraftServer,
    statuses
}