const $ = (e) => document.querySelector(e);
const socket = io('ws:///')
const serverStatus = {
    "arma-status": 'NaN',
    "planetary": 'NaN',
    "argentino-status": 'NaN',
}

socket.on('connect', () => {
    socket.emit('status_request')
})

socket.on('status_response', servers => {
    const list = $('#server-list')
    // Update all values
    for (const server of servers) {
        const currElement = $(`#${server.htmlID}`);
        // If element doesn't exist
        if (!currElement) {
            // Create list element
            const element = document.createElement('li')
            element.className = "list-group-item d-flex"
            element.innerHTML = `<span class="me-auto" id="${server.htmlID}">${server.status}</span>` +
                `<span>${server.displayName}</span>` +
                `<button type="button" class="btn btn-success btn-sm ms-5" id="${server.htmlID}-button-start">START</button>` +
                `<button type="button" class="btn btn-danger btn-sm ms-5" id="${server.htmlID}-button-stop">STOP</button>`

            // Add element to the list
            list.append(element)

            // Send start request to server on press
            $(`#${server.htmlID}-button-start`).addEventListener('click', ()=>{
                if (server.htmlID === 'planetary')
                    socket.emit(`start_server_request`, server.htmlID);
                else
                    alert("Nie ma")
            })
            // Send stop request to server on press
            $(`#${server.htmlID}-button-stop`).addEventListener('click', ()=>{
                    // socket.emit(`stop_server-request`, server.htmlID);
                alert("Nie ma takich jeszcze")
            })
        }
        else{
            // Else just update the status
            currElement.innerText = server.status;
        }
    }
})