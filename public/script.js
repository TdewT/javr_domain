const $ = (e) => document.querySelector(e);
const socket = io('ws:///')
const serverStatus = {
    "arma-status": 'NaN',
    "planetary": 'NaN',
    "argentino-status": 'NaN',
}

const statuses = {
    "ONLINE": "🟢", "LAUNCHING": "🟡", "OFFLINE": "🔴",
}
socket.on('connect', () => {
    socket.emit('status_request')
})

socket.on('dowidzenia', papa => {
    window.location.href = papa;
})

socket.on('status_response', servers => {
    const list = $('#server-list')
    // Update all values
    for (let server of servers) {
        const statusElement = $(`#${server.htmlID}-status`);
        const countElement = $(`#${server.htmlID}-player-count`);
        // If element doesn't exist
        if (!statusElement) {
            // Create list element
            const element = document.createElement('li')
            element.className = "list-group-item d-flex"
            element.innerHTML += `<span class="me-4" id="${server.htmlID}-status">${server.status}</span>`
            if (server.status === 'ONLINE') {
                element.innerHTML += `<span class="me-auto" id="${server.htmlID}-player-count">${server.currPlayers.length +'/'+ server.maxPlayers}</span>`
            }
            else {
                element.innerHTML += `<span class="me-auto" id="${server.htmlID}-player-count"></span>`
            }
            element.innerHTML += `<span>${server.displayName}</span>`
            element.innerHTML += `<button type="button" class="btn btn-success btn-sm ms-5" id="${server.htmlID}-button-start">START</button>`
            element.innerHTML += `<button type="button" class="btn btn-danger btn-sm ms-5" id="${server.htmlID}-button-stop">STOP</button>`

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
                // alert("Nie ma takich jeszcze")
            })

        }
        else {
            // Else just update the values
            statusElement.innerText = server.status;
            if (server.status === statuses.ONLINE) {
                countElement.innerText = server.currPlayers.length +'/'+ server.maxPlayers;
            }
            else{
                countElement.innerText = '';
            }
        }
    }
})

socket.on('request_failed', err => {
    alert('Nie da się tego uczynić, albowiem: ' + err)
})