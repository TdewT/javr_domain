const $ = (e) => document.querySelector(e);
const socket = io('ws:///')

const statusIndicators = {
    "online": "🟢", "starting": "🟡", "busy": "🟡", "offline": "🔴",
}

socket.on('connect', () => {
    socket.emit('status_request')
})

socket.on('status_response', servers => {
    const list = $('#server-list')
    // Update all values
    for (let server of servers) {
        const statusElement = $(`#${server.htmlID}-status`);
        const statusTxtElement = $(`#${server.htmlID}-status-text`);
        // If element doesn't exist
        if (!statusElement) {
            // Create list element
            const element = document.createElement('li');

            // Generate list of servers
            element.className = "list-group-item d-flex"
            element.innerHTML +=
                `<span class="server-status-box me-auto" id="${server.htmlID}-server-status-box">` +
                `<span class="me-4" id="${server.htmlID}-status">${statusIndicators[server.status]}</span>` +
                `<span id="${server.htmlID}-status-text">${getStatusText(server)}</span>` +
                `</span>`
            element.innerHTML += `<span>${server.displayName}</span>`
            element.innerHTML += `<span>` +
                `<button type="button" class="button btn btn-success btn-sm ms-5" id="${server.htmlID}-button-start">START</button>` +
                `<button type="button" class="button btn btn-danger btn-sm ms-5" id="${server.htmlID}-button-stop">STOP</button>` +
                `</span>`

            // Create player list
            if (server.className === "Minecraft Server" || true) {
                setTimeout(() => {
                    generatePlayerList(server)
                }, 500,)
            }

            // Add element to the list
            list.append(element)

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
        else {

            if (server.className === "Minecraft Server" || true) {
                generatePlayerList(server);
            }
            // Else just update the values
            statusElement.innerText = statusIndicators[server.status];
            statusTxtElement.innerText = getStatusText(server);
        }
    }
})

function getStatusText(server) {
    if (server.status === 'online' && server.currProcess === null) return 'Online';
    if (server.status === 'online' && server.maxPlayers !== 0) return server.currPlayers.length + '/' + server.maxPlayers;
    if (server.status === 'starting') return "Starting...";
    if (server.status === 'busy') return "Port is busy";
    if (server.status === 'offline') return 'Offline';
    return 'Starting...'
}

function isPlayerDisplayed(server, playerList, player) {
    if (!playerList) {
        return false
    }
    for (const child of playerList.children) {
        if (child.innerText === player) {
            return true;
        }
    }
    return false;
}

function generatePlayerList(server) {
    const tooltipElement = $(`#${server.htmlID}-server-status-box`);
    const playerList = $(`#${server.htmlID}-player-list`);

    if (!playerList) {
        const playerList = document.createElement('ul');
        playerList.className = 'list-group list-group-flush';
        playerList.id = `${server.htmlID}-player-list`;

        tooltipElement.appendChild(playerList)
    }

    // Create entry for each player on the server
    setTimeout(() => {
        const playerList = $(`#${server.htmlID}-player-list`)
        if (server.status !== "offline" && server.currPlayers.length > 0) {
            // Get all players displayed on site and on the server
            let allPlayers = server.currPlayers;
            const displayedPlayers = getDisplayedPlayers(server);
            allPlayers = allPlayers.concat(displayedPlayers);
            allPlayers = [...new Set(allPlayers)]

            for (const player of allPlayers) {
                if (!isPlayerDisplayed(server, playerList, player)) {
                    const playerEntry = document.createElement('li');
                    playerEntry.className = `list-group-item`;
                    playerEntry.innerText = player;
                    playerList.appendChild(playerEntry);
                }
                else if (playerList.children.length >= 0 && !server.currPlayers.includes(player)) {
                    for (const child of playerList.children) {
                        if (child.innerText === player) {
                            child.remove();
                        }
                    }
                }
            }
        }
        else {
            if (playerList && playerList.children.length > 0) {
                for (const child of playerList.children) {
                    child.remove()
                }
            }
        }
    }, 500, server)

}

function getDisplayedPlayers(server) {
    const playerList = $(`#${server.htmlID}-player-list`);
    let displayedPlayers = [];
    if (playerList.children.length >= 0) {
        for (const child of playerList.children) {
            displayedPlayers.push(child.innerText);
        }
    }
    console.log(displayedPlayers)
    return displayedPlayers;
}

socket.on('request_failed', err => {
    alert('Nie da się tego uczynić, albowiem: ' + err)
})