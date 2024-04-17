const { exec } = require('child_process');

function killTask(name, PID) {
    console.log(PID);
    if (PID){
        exec(`taskkill /pid ${PID}`, (error, stdout, stderr) => {
            if (error){
                console.error(`[${name}]: ${error}`);
            }
            if (stderr) {
                console.log(`[${name}]: ${stderr}`);
            }
        })
    }
}

module.exports = {
    killTask
};