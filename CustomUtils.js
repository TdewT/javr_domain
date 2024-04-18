const { exec } = require('child_process');

function killTask(name, PID) {
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

function removeDuplicateSpace(string){
    return string.replace( /\s\s+/g, ' ');
}

module.exports = {
    killTask,
    removeDuplicateSpace
};