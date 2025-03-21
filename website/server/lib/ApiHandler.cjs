const tokenManager = require("@server-lib/JavrTokenManager.cjs");
const {customLog} = require("@server-utils/custom-utils.cjs");
const {serverList} = require("@server-lib/globals.js");

// Name that will be displayed in logs
const logName = "api-handler";


// Currently supported requestMethods
const requestMethods = {
    GET: "GET",
    POST: "POST",
};

class ApiHandler {
    #app;
    constructor(app) {
        this.#app = app;

        // Stores endpoint paths that are initialised
        this.usedEndpoints = [];
    }

    // Generalised endpoint
    newEndpoint(token, body, method = requestMethods.GET) {
        // Bind request functions to methods
        const requestFunctions = {
            GET: (path, handler) => this.#app.get(path, handler),
            POST: (path, handler) => this.#app.post(path, handler),
        };

        // Choose the correct request function for method passed as argument
        const methodHandler = requestFunctions[method];

        // If method is found in enum use assigned request function
        if (methodHandler) {
            // Create endpoint for the request
            const path = `/api/${token}/servers`;
            methodHandler(path, (req, resp) => {
                // Check if token for that endpoint is still valid
                if (tokenManager.tokenValues().includes(token)){
                    // Send back the response
                    resp.json(body);
                }
                else{
                    // If not send back 403 forbidden
                    resp.status(403).send({
                        message: "Token expired",
                    })
                }
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
        this.#app.get("/api/token", (req, resp) => {
            // Get ip address of sender
            const clientIP = req.ip;

            // Check if this ip already has token
            if (tokenManager.hasToken(clientIP)) {
                customLog(logName, `Refreshing token for ${clientIP}`);
                const indexToRemove = this.usedEndpoints.indexOf(clientIP);
                this.usedEndpoints.slice(indexToRemove, 1)
            }

            // Generate and send back new token
            const newToken = tokenManager.generateToken(clientIP, this);
            resp.json({token: newToken})
        });
    }


    // Create all endpoints for all authorised users
    createEndpoints(){
        customLog(logName, "Creating api endpoints");

        // Create endpoints for server information
        for (const token of tokenManager.tokenValues()) {
            const path = `/api/${token}/servers`;

            // Check if endpoint was already established
            if (!this.usedEndpoints.includes(path)){
                customLog(logName, `Adding new endpoint at ${path}`);

                // Convert servers to a format that's more comprehensible in JSON
                let serversJSON = {};
                for (const server of serverList) {
                    // Assign server objects to entry with their htmlID
                    serversJSON[server.htmlID] = server;
                }

                // Create endpoints for retrieving info about servers
                this.newEndpoint(token, serversJSON, requestMethods.POST);
            }
        }
    }
}

module.exports = ApiHandler;
