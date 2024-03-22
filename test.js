// const child_process = require('child_process');
//
// const minecraftPath = "E:\\Serwery\\AF server"
// const minecraftStarter = 'java -jar minecraft_server.1.12.2.jar nogui'
//
// let runningServer = child_process.spawn(
//     "java",
//     ["-jar", "minecraft_server.1.12.2.jar", "nogui"],
//     {cwd: minecraftPath}
// );
//
// runningServer.stdout.on('data', function (data) {
//     console.log('' + data);
// })
//
// runningServer.on('error', function (error) {
//     console.error(error)
// });
//
// runningServer.stderr.on('data', function (data) {
//     console.log(data)
// });
//
// runningServer.stdin.write('stop \\r')
// runningServer.stdin.end()
//
// function extractNums(str){
//     let res = '';
//     for (const char of str) {
//         if (char >= '0' && char <= '9') {
//             res += char;
//         }
//     }
//     return res
// }
//
// str = "There are 0/20 players online:"
//
// players = str.split("/")
// console.log(extractNums(players[0])+"/"+extractNums(players[1]))

const {CustomServer, MinecraftServer} = require("./CustomServers");

const servers = [
    new MinecraftServer(25565, 'planetary', 'Minecraft: Planetary'),
    new CustomServer(2344, 'arma', 'Arma 3: Antistasi')
]

let server = servers[1];


console.log(server);

servers[1].status = 'NOPE';

server = servers.filter((s) => {
    return s.htmlID === server.htmlID
})

console.log(server);