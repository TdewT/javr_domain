const statusIndicators = {
    "online": "🟢", "starting": "🟡", "busy": "🟡", "stopping": "🟡", "offline": "🔴", "I have crashed...": "🔴"
};


function getStatusText(server) {
    if (server.type === "minecraft" && server.currPlayers && server.maxPlayers > 0) {
        if (server.status === 'Stopping...' || server.status === 'Starting...') return startCountTimeout(server)
        if (server.status === 'online') return server.currPlayers.length + '/' + server.maxPlayers;
    }
    if (server.status === 'online') return 'Online';
    if (server.status === 'starting') return "Starting...";
    if (server.status === 'busy') return "Port is busy";
    if (server.status === 'stopping') return 'Stopping...';
    if (server.status === 'offline') return 'Offline';
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

function startCountTimeout(server){
    
    let timeout = 120;

    for(let t = 0; t>timeout;t++){
        t++;
        if(server.status !== 'Stopping...' || server.status !== 'Starting...'){
            return server.status;
        }
    }

    return 'I have crashed...';
}