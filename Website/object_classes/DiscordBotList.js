const {customLog} = require("../utils/CustomUtils");
const {serverManagers, discordBots} = require("../utils/SharedVars");

const logName = "Discord_Bot_List";

class DiscordBotList {
    static discordBotsWithHosts = {};
    static autostart = [];

    static init(websiteIO) {
        DiscordBotList.discordBotsWithHosts['local'] = null;
        for (const argument of arguments) {
            customLog(logName, "Initialising");
            for (let serverManager of serverManagers) {
                DiscordBotList.discordBotsWithHosts[serverManager.name] = null;
            }
        }
    }

    static updateBots(managerName, bots) {
        customLog(logName, `Updating bot list for ${managerName}`);
        // Update Discord bot list for the manager
        DiscordBotList.discordBotsWithHosts[managerName] = bots;
        // Update list with all Discord bots
        DiscordBotList.updateAllBots();
    }

    static getBotsStatuses(){
        let states = [];
        for (const bot of discordBots) {
            states.push({htmlID: bot.htmlID, displayName: bot.displayName, status: bot.status});
        }
        return states;
    }

    static updateAllBots() {
        // Get all Discord bots
        let botListArr = Object.values(DiscordBotList.discordBotsWithHosts);
        // Clear old bots
        discordBots.length = 0;
        // Extract individual Discord bots and add them to discordBots
        for (const botArr of botListArr) {
            if (botArr != null){
                for (const bot of botArr) {
                    discordBots.push(bot)
                }
            }
        }
    }

    static getBotByHtmlID = (botID) => discordBots.filter((s) => {
        return s.htmlID === botID
    })[0];
}

module.exports = DiscordBotList;