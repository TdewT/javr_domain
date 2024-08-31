const statusIndicators = {
    "online": "🟢", "starting": "🟡", "busy": "🟡", "stopping": "🟡", "offline": "🔴",
};


function getStatusText(serviceObject) {
    if (serviceObject.type === "minecraft" && serviceObject.currPlayers && serviceObject.maxPlayers > 0) {
        if (serviceObject.status === 'online') return serviceObject.currPlayers.length + '/' + serviceObject.maxPlayers;
    }
    if (serviceObject.status === 'online') return 'Online';
    if (serviceObject.status === 'starting') return "Starting...";
    if (serviceObject.status === 'busy') return "Port is busy";
    if (serviceObject.status === 'stopping') return 'Stopping...';
    if (serviceObject.status === 'offline') return 'Offline';
    return 'Starting...';
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
        const playerList = $(`#${server.htmlID}-player-list`);
        if (server.status !== "offline" && server.currPlayers.length > 0) {
            // Get all players displayed on site and on the server
            let allPlayers = server.currPlayers;
            const displayedPlayers = getDisplayedPlayers(server);
            allPlayers = allPlayers.concat(displayedPlayers);
            allPlayers = [...new Set(allPlayers)];

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
    return displayedPlayers;
}