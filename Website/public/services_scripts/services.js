const socket = io('ws:///');

const $ = (e) => document.querySelector(e);

let serviceListElement;

socket.on('status_response', (services) => {
    // Get list element
    serviceListElement = $("#service-list");
    const servers = services.servers;
    const discordBots = services.discordBots;
    const serverManagers = services.serverManagers;

    if (serverManagers){
        syncServerManager(serverManagers);
    }

    // Generate or update elements for Discord bots
    if (discordBots) {
        syncDiscordBots(discordBots);
    }

    // Generate or update elements for servers
    if (servers) {
        syncServers(servers);
    }

});

socket.on('request_failed', err => {
    alert('Errer, albowiem: ' + err)
});

socket.on('info', info => {
    alert(info);
});