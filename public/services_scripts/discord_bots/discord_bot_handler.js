function syncDiscordBots(bots){
    // Go through all passed bots
    for (const bot of bots) {
        // Check if bot was already loaded
        if (!$(`#${bot.htmlID}-bot-status-box`)){
            printBot(bot);
        }
        else{
            updateBot(bot);
        }
    }
}

function printBot(bot){
    // Create element and set it's classes
    const botElement = document.createElement("li");
    botElement.className = "list-group-item d-flex";

    // Display status
    botElement.innerHTML +=
        `<div id="${bot.htmlID}-bot-status-box" class="bot-status-box me-auto flex">` +
        `<span class="me-4" id="${bot.htmlID}-status">${statusIndicators[bot.status]}</span>` +
        `<span class="me-4" id="${bot.htmlID}-status-text">${getStatusText(bot)}</span>` +
        `</div>`;

    // Display name
    botElement.innerHTML +=
        `<span class="me-name">${bot.displayName}</span>`;

    return botElement;
}

function updateBot(bot){
    // Get relevant elements
    const indicatorElement = $(`#${bot.htmlID}-status`);
    const statusTxtElement = $(`#${bot.htmlID}-status-text`);

    // Change values
    indicatorElement.innerText = statusIndicators[bot.status];
    statusTxtElement.innerText = getStatusText(bot);
}