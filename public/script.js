const $ = (e) => document.querySelector(e);
const socket = io('ws:///')
const serverStatus = {
    "arma-status": 'NaN',
    "planetary-status": 'NaN',
    "argentino-status": 'NaN',
}

socket.on('connect', () => {
    socket.emit('status_request')
})

socket.on('status_response', servers => {
    const list = $('#server-list')
    for (const server of servers) {
        const currElement = $(`#${server.htmlID}`);

        if (!currElement) {
            const element = document.createElement('li')
            element.className = "list-group-item d-flex"
            element.innerHTML = `<span class="me-auto" id="${server.htmlID}">${server.status}</span>` + `<span>${server.displayName}</span>`
            list.append(element)
        }
        else{
            currElement.innerText = server.status;
        }
    }
})
