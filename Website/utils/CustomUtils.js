const fs = require("node:fs");
let logStream;

function customLog(name, str) {

    // Get and format date and time now
    let time = new Date().toLocaleString();
    // Reformat date
    time = time.replaceAll("/", "-");
    time = time.replaceAll(",", " |");

    // Trim the string and remove unwanted special chars
    if (typeof str === "string"){
        str = str.trim().replace(/[\r\n]+/gm, '');
    }
    // Final log text
    const logTxt = `[${time}] [${name}]: ${str}`;

    // Create directory if it doesn't exist
    createLogsDir();

    // Create stream to log file
    if (!logStream)
        createLogStream();

    // Write to log file and console
    logStream.write(logTxt + '\n');
    console.log(logTxt);
}

function createLogsDir() {
    const folderPath = "./logs";


    // Check if the directory exists, if not, create it
    if (!fs.existsSync(folderPath)) {
        try {
            fs.mkdirSync(folderPath, {recursive: true});
        }
        catch (err) {
            console.error('Error in creating logs directory!', err);
        }
    }
}

function createLogStream() {
    let time = new Date().toLocaleString();

    // Assign filename based on time
    time = time.replaceAll("/", "-");
    time = time.replaceAll(",", " _");
    time = time.replaceAll(" ", "");
    let logFileName = time.replaceAll(":", "-");

    // Assign file path
    const filePath = `./logs/${logFileName}.txt`;
    logStream = fs.createWriteStream(filePath, {flags: 'a'});
}

//Find server in servers[] by server.htmlID
const getServerByHtmlID = (servers, serverID) => servers.filter((s) => {
    return s.htmlID === serverID
})[0];
//Find Discord bot in discordBots[] by server.htmlID
const getDbotByHtmlID = (discordBots,botID) => discordBots.filter((b) => {
    return b.htmlID === botID
})[0];

// Sending servers statuses
function emitDataGlobal(socket, event, data) {
    socket.emit(event, data);
}

module.exports = {
    customLog,
    getServerByHtmlID,
    getDbotByHtmlID,
    emitDataGlobal,
};