const tokenManager = require("./managers/TokenManager");
const {customLog} = require("./CustomUtils");
const {servers} = require("./index");

// Name that will be displayed in logs
const logName = "api-handler";



const requestMethods = {
    GET: "GET",
    POST: "POST",
};

class ApiHandler {

    constructor(app) {
        this.app = app;
        this.usedEndpoints = [];
    }

    // Generalised endpoint
    newEndpoint(token, body, method = requestMethods.GET) {
        // Bind request functions to methods
        const requestFunctions = {
            GET: (path, handler) => this.app.get(path, handler),
            POST: (path, handler) => this.app.post(path, handler),
        };

        // Choose the correct request function for method passed as argument
        const methodHandler = requestFunctions[method];

        // If method is found in enum use assigned request function
        if (methodHandler) {
            // Create endpoint for the request
            const path = `/api/${token}/servers`;
            methodHandler(path, (req, resp) => {
                resp.json(body);
            });

            // Register endpoint to avoid duplication
            this.usedEndpoints.push(path);
        }
        // if not then it's not supported
        else {
            customLog(logName, "Unsupported method, endpoint not created")
        }
    }

    // Endpoint for acquiring tokens (Should be called only once)
    newTokenEndpoint() {
        // Create endpoint
        this.app.get("/api/token", (req, resp) => {
            // Get ip address of sender
            const clientIP = req.ip;

            // Check if this ip already has token
            if (!tokenManager.hasToken(clientIP)) {
                // Generate and send back new token
                const newToken = tokenManager.generateToken(clientIP, this);
                resp.send(newToken)
            }
            else {
                // Send back existing token
                resp.send(tokenManager.getToken(clientIP))
            }
        });
    }


    // Create all endpoints for all authorised users
    createEndpoints(){
        customLog(logName, "Creating api endpoints");
        // Create api endpoints for all authorised users

        // Create endpoints for server information
        for (const token of tokenManager.tokenValues) {
            const path = `/api/${token}/servers`;
            // Check if endpoint was already established
            if (!this.usedEndpoints.includes(path)){

                // Convert servers to a format that's more comprehensible in JSON
                let serversJSON = {};
                for (const server of servers) {
                    // Assign server objects to entry with their htmlID
                    serversJSON[server.htmlID] = server;
                }

                // Create endpoints for retrieving info about servers
                this.newEndpoint(token, serversJSON, requestMethods.POST);
            }
        }
    }
}

module.exports = {
    ApiHandler,
};