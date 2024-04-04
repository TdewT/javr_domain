// Create server element
function printServer(server) {
    if (server.type === "minecraft") {
        createMinecraftElement(server);
    }
    else if (server.type === "arma") {

    }
    else {
        createGenericElement(server);
    }
}

// Update server element
function updateServer(server) {
    if (server.type === "minecraft") {
        updateMinecraftServer(server);
    }
    else if (server.type === "arma") {

    }
    else {
        updateGenericServer(server);
    }
}



// Create and add element to DOM
function createGenericElement(server) {
    const serverElement = getGenericElement(server);

    serverListElement.appendChild(serverElement);
}
function createMinecraftElement(server) {
    const serverElement = getMinecraftElement(server);

    serverListElement.appendChild(serverElement);

    // Send start request to server on press
    $(`#${server.htmlID}-button-start`).addEventListener('click', () => {
        // If this command is supported for this server send request
        socket.emit(`start_server_request`, server.htmlID);
    })
    // Send stop request to server on press
    $(`#${server.htmlID}-button-stop`).addEventListener('click', () => {
        socket.emit('stop_server_request', server.htmlID);
    })
}

// Update existing server
function updateGenericServer(server) {
    // Get relevant elements
    const indicatorElement = $(`#${server.htmlID}-status`);
    const statusTxtElement = $(`#${server.htmlID}-status-text`);

    // Change values
    indicatorElement.innerText = statusIndicators[server.status];
    statusTxtElement.innerText = getStatusText(server);
}
function updateMinecraftServer(server) {
    // This part is the same for both
    updateGenericServer(server)

    // Update players
    generatePlayerList(server)
}

// Generate server element
function getGenericElement(server) {
    // Create element and set it's classes
    const serverElement = document.createElement("li");
    serverElement.className = "list-group-item d-flex";

    // Display status
    serverElement.innerHTML +=
        `<div id="${server.htmlID}-server-status-box" class="server-status-box me-auto flex">` +
            `<span class="me-4" id="${server.htmlID}-status">${statusIndicators[server.status]}</span>` +
            `<span class="me-4" id="${server.htmlID}-status-text">${getStatusText(server)}</span>` +
        `</div>`

    // Display name
    serverElement.innerHTML +=
        `<span class="me-name">${server.displayName}</span>`

    return serverElement
}
function getMinecraftElement(server) {

    // Get basic part of element from GenericServer
    let serverElement = getGenericElement(server)

    // Remove margin to make place for buttons
    serverElement.querySelector(".me-name").className = '';

    // Add buttons
    serverElement.innerHTML +=
        `<span>` +
        `<button type="button" class="button btn btn-success btn-sm ms-5" id="${server.htmlID}-button-start">START</button>` +
        `<button type="button" class="button btn btn-danger btn-sm ms-5" id="${server.htmlID}-button-stop">STOP</button>` +
        `</span>`


    serverListElement.appendChild(serverElement);

    generatePlayerList(server)

    return serverElement;
}

