// Load saved api-tokens
const {writeFile} = require("node:fs");
const {customLog} = require("../CustomUtils");
let apiTokens = require('../configs/api_tokens.json');
const {servers} = require("../index");

// Name to be displayed in logs
const logName = "token-manager";

// Generate token
function generateToken(identifier, apiHandler) {

    customLog(logName, `Generating new api token for ${identifier}`);

    // Initialise token for future additions
    let token = "";

    // Run string generator a few times to get longer string
    for (let i = 0; i < 4; i++) {
        // Generate number based on current timestamp
        let tokenPart = Math.round(Date.now() * (Math.random() * 100));
        // Convert to base36 string
        tokenPart = tokenPart.toString(36);
        // Add to final token
        token += tokenPart;
    }

    // Save for future use
    saveToken(token, identifier);

    // Create endpoint for the new token
    apiHandler.createEndpoints(servers);

    return token;
}


function saveToken(token, identifier) {
    // Add token to list
    apiTokens["tokens"][identifier] = token;

    // Write the updated tokens object back to api_tokens.json
    writeFile('./configs/api_tokens.json', JSON.stringify(apiTokens), (err) => {
        if (err) customLog(logName, err);
        else customLog(logName, "Token saved successfully.");
    });
}

// Check if given identifier has registered api token
function hasToken(identifier) {
    return tokenKeys().includes(identifier);
}

// Check if api token is present in server's files
function getToken(identifier) {
    return apiTokens["tokens"][identifier];
}

function tokenValues() {
    return Object.values(apiTokens["tokens"]);
}
function tokenKeys() {
    return Object.keys(apiTokens["tokens"]);
}

module.exports = {
    tokenValues,
    tokenKeys,
    generateToken,
    hasToken,
    getToken,
};