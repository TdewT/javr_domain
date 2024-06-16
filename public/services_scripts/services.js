const socket = io('ws:///');

const $ = (e) => document.querySelector(e);

let serverListElement;

socket.on('connect', () => {
    socket.emit('status_request');
});

socket.on('status_response', (services) => {
    // Get list element
    serverListElement = $("#server-list");
    const servers = services["servers"];
    const discordBots = services["discordBots"];
    console.log(servers);

    // Generate or update elements for servers
    generateServers(servers);

    // Generate or update elements for Discord bots
    generateDiscordBots(discordBots);

});

socket.on('request_failed', err => {
    alert('Nie da się tego uczynić, albowiem: ' + err)
});

