const {readdirSync, readFileSync, writeFile} = require("node:fs");
const {customLog} = require("./CustomUtils");

const logName = "config-manager";

// Dictionary of supported configs
const configTypes = {
    apiTokens: "api_tokens.json",
    minecraftJavaVer: "minecraft_java_ver.json",
    serversInfo: "servers_info.json",
};

class ConfigManager {
    // Dictionary of loaded configs
    static loadedConfigs = {};

    // Load all configs from ./configs
    static loadConfigs() {
        ConfigManager.allconfigs = readdirSync('./configs');

        // Iterate through all files in ./configs
        for (const config of ConfigManager.allconfigs) {
            // Check if file is supported type of config
            if (Object.values(configTypes).includes(config)) {
                // Load config into the dictionary
                ConfigManager.loadedConfigs[config] = JSON.parse(readFileSync(`./configs/${config}`, 'utf8'));

                customLog(logName, `Config loaded ${config}`);
            }
            else {
                customLog(logName, `Unsupported config not loaded ${config}`);
            }
        }
    }

    static saveConfig(configType, data) {
        writeFile(`./configs/${configType}`, JSON.stringify(data), (err) => {
            if (err) customLog(logName, err);
            else customLog(logName, `Config ${configType} saved successfully.`);
        });
    }

    static getConfig(configType) {
        return ConfigManager.loadedConfigs[configType];
    }
}

module.exports = {ConfigManager, configTypes};