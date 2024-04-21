const {exec} = require('child_process');
const fs = require("node:fs");
let logStream;

function killTask(name, PID) {
    if (PID) {
        exec(`taskkill /pid ${PID}`, (error, stdout, stderr) => {
            if (error) {
                customLog(name, `${error}`);
            }
            if (stderr) {
                customLog(name, `${stderr}`);
            }
        })
    }
}

function removeDuplicateSpace(string) {
    return string.replace(/\s\s+/g, ' ');
}

function extractNums(data) {
    let res;
    if (typeof data === "string") {
        res = '';
        for (const char of data) {
            if (char >= '0' && char <= '9') {
                res += char;
            }
        }
        return Number(res)
    }
    else if (typeof data === "object") {
        res = [];
        for (let i = 0; i < data.length; i++) {
            let tmp = '';
            for (const char of data[i]) {
                if (char >= '0' && char <= '9') {
                    tmp += char;
                }
            }
            if (tmp !== '')
                res.push(tmp);
        }
        return res
    }
    else{
        throw new Error('Function "extractNums()" only takes string or object type arguments');
    }
}

function customLog(name, str){

    // Get and format date and time now
    let time = new Date().toLocaleString();
    // Reformat date
    time = time.replaceAll("/", "-");
    time = time.replaceAll(",", " |");



    // Final log text
    const logTxt = `[${time}] [${name}]: ${str}`;

    // Write to log file and console
    logStream.write(logTxt+'\n');
    console.log(logTxt);
}

function createLogStream() {
    let time = new Date().toLocaleString();

    // Assign filename based on time
    time = time.replaceAll("/", "-");
    time = time.replaceAll(",", " -");
    time = time.replaceAll(" ", "");
    let logFileName = time.replaceAll(":", "-");

    // Assign file path
    const filePath = `./logs/${logFileName}.txt`;
    logStream = fs.createWriteStream(filePath, { flags: 'a' });
}

module.exports = {
    killTask,
    removeDuplicateSpace,
    extractNums,
    customLog,
    createLogStream
};