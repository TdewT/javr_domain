const socket = io('ws:///')

const $ = (e) => document.querySelector(e);

let serverListElement;

socket.on('connect', () => {
    socket.emit('status_request');
})

socket.on('status_response', servers => {
    // Get list element
    serverListElement = $("#server-list");

    // Add to server list or update value
    for (let server of servers) {
        if (!$(`#${server.htmlID}-server-status-box`)){
            printServer(server);
        }
        else {
            console.log("updating")
            updateServer(server);
        }
    }

})

socket.on('request_failed', err => {
    alert('Nie da się tego uczynić, albowiem: ' + err)
})

