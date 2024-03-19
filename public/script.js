const $ = (e)=>document.querySelector(e);
const socket = io('ws:///')
const serverStatus = {
    "arma-status": 'NaN',
    "planetary-status": 'NaN',
    "argentino-status": 'NaN',
}

socket.on('connect', client => {
    socket.emit('status_request')
})

socket.on('status_response', (stats) => {
    const statsKeys = Object.keys(stats)
    for (const statKey of statsKeys) {
        const statElement = $("#"+statKey);
        statElement.innerText = stats[statKey];
    }
})

// const buton = $("#test")
// buton.addEventListener('onclick', ()=>{
//     socket.emit('refresh_request')
// })