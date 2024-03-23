// // Paste into script.js
// // FIXME: input console
// const dummyServers = [{
//     port: 25563,
//     htmlID: "tesots",
//     displayName: "do testos",
//     status: "online",
//     path: "",
//     currProcess: null,
//     currPlayers: [
//         "TdewT",
//         "John Cena",
//         "Luluś"
//     ],
//     maxPlayers: 20,
//     startArgs: [
//         "-jar",
//         "minecraft_server.1.12.2.jar",
//         "nogui"
//     ]
// },
//     {
//         port: 25565,
//         htmlID: "domestos",
//         displayName: "domestos",
//         status: "online",
//         path: "",
//         currProcess: null,
//         currPlayers: [
//             "Zraz",
//             "Wirus",
//             "Bakterian"
//         ],
//         maxPlayers: 15,
//         startArgs: [
//             "-jar",
//             "minecraft_server.1.12.2.jar",
//             "nogui"
//         ]
//     },
//     {
//         port: 25566,
//         htmlID: "frajer",
//         displayName: "tego nie ma",
//         status: "offline",
//         path: "",
//         currProcess: null,
//         currPlayers: [],
//         maxPlayers: 0,
//         startArgs: [
//             "-jar",
//             "minecraft_server.1.12.2.jar",
//             "nogui"
//         ]
//     }
// ]
// setTimeout(() => {
//     const inputElement = document.createElement('input')
//     inputElement.id = "dev"
//     $('body').appendChild(inputElement)
//     inputElement.addEventListener('keydown', (event) => {
//         if (event.keyCode === 13) {
//             console.log(event.target.value)
//             const input = event.target.value.split(' ');
//             const index = input[0];
//             const key = input[1];
//             let value = input[2]
//
//             if (input.length >= 3) {
//                 if (key === 'currPlayers') {
//                     value = value.split(';')
//                 }
//                 dummyServers[index][key] = value
//                 console.log(dummyServers[index])
//             }
//         }
//     })
// }, 1000)
//
//
// // Paste into script.js socket.on('status_response')
// //FIXME: Read dummy servers for testing
// servers = dummyServers
//
// // Paste into index.js socket.on('connection')
// // FIXME: forced refresh for testing
// setInterval(()=>{
//     io.emit('status_response', servers)
// }, 1000)