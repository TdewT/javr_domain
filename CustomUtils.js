const {exec} = require('child_process');

function killTask(name, PID) {
    console.log(PID);
    if (PID) {
        exec(`taskkill /pid ${PID}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`[${name}]: ${error}`);
            }
            if (stderr) {
                console.log(`[${name}]: ${stderr}`);
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

module.exports = {
    killTask,
    removeDuplicateSpace,
    extractNums
};