// External imports
const {writeFile} = require("node:fs");
// Local imports
const {customLog} = require("../CustomUtils");
const {servers} = require("../index");

// Load saved api-tokens
let apiTokens = require('../configs/api_tokens.json');

// Name to be displayed in logs
const logName = "token-manager";

// Generate token
function generateToken(identifier, apiHandler) {

    customLog(logName, `Generating api token for ${identifier}`);

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

    // Create endpoints for the new token
    apiHandler.createEndpoints(servers);

    return token;
}


function saveToken(token, identifier) {
    // Add token to list
    apiTokens["tokens"][identifier] = token;

    // Write the updated token object back to file storing tokens
    writeFile('./configs/api_tokens.json', JSON.stringify(apiTokens), (err) => {
        if (err) customLog(logName, err);
        else customLog(logName, "Token saved successfully.");
    });
}

// Check if given identifier has registered api token
function hasToken(identifier) {
    return tokenKeys().includes(identifier);
}

// Get api token by identifier
function getToken(identifier) {
    return apiTokens["tokens"][identifier];
}

// Get an array of all saved tokens
function tokenValues() {
    return Object.values(apiTokens["tokens"]);
}
// Get an array of all saved users
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