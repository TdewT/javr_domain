const {SerialPort, ReadlineParser} = require("serialport");
const {arduinoBoards} = require("@server-lib/globals.js");
const {customLog} = require("@server-utils/custom-utils.cjs");
const SocketEvents = require("@server-lib/SocketEvents.cjs");

class ArduinoUtils {
    static logName = "Arduino_Utils";

    static Events = {
        STATUS_UPDATE: "status-update",
        TIME_UPDATE_REQUEST: "time-update-request",
        TIME_UPDATE_RESPONSE: "time-update-response",
        MESSAGE_END: "message-end",
    };

    static initialiseBoards(arduinos) {
        SerialPort.list().then(ports => {
            for (const port of ports) {
                const arduino = arduinos[port.productId];
                if (arduino) {
                    const board = new ArduinoBoard(Object.assign({}, arduino, {serialPort: port,}));
                    arduinoBoards.push(board);
                    customLog(this.logName, `Found board ${board.name} on: ${port.path}`);
                    board.startCommunication();
                }
            }
        });
    }
}

class ArduinoBoard {
    sensors = {};

    constructor({
                    name: name,
                    serialPort: serialPort,
                    baudRate: baudRate,
                }) {
        this.name = name;
        this.serialPort = new SerialPort({
            path: serialPort.path,
            baudRate: baudRate
        });
    }

    sendTimeResponse() {
        const time = Date.now();
        const message = ArduinoUtils.Events.TIME_UPDATE_RESPONSE + time + ArduinoUtils.Events.MESSAGE_END;
        this.serialPort.write(message, (err) => {
            if (err) {
                customLog(this.name, `Error sending data: ${err}`)
            }
        });
    }

    startListening() {
        const parser = this.serialPort.pipe(new ReadlineParser({delimiter: '\n'}));

        this.serialPort.on("error", (err) => {
            customLog(this.name, err)
        });

        parser.on('data', (data) => {
            data = data.trim();
            if (!data.endsWith(ArduinoUtils.Events.MESSAGE_END)) {
                customLog(this.name, "Error reading message");
            }
            else {
                // Remove message end
                data = data.replace(ArduinoUtils.Events.MESSAGE_END, "")
            }

            // If message is status update
            if (data.startsWith(ArduinoUtils.Events.STATUS_UPDATE)) {
                // Remove header
                data = data.replace(ArduinoUtils.Events.STATUS_UPDATE, "");

                // Update data and send update
                const ServerInstance = require("@server-lib/ServerInstance.cjs");
                try {
                    this.sensors = JSON.parse(data);
                }
                catch (err) {
                    customLog(this.name, `Error parsing data: ${err}`)
                }
                if (ServerInstance.websiteIO) {
                    SocketEvents.statusResponse(ServerInstance.websiteIO);
                }
            }

            else if (data.startsWith(ArduinoUtils.Events.TIME_UPDATE_REQUEST)) {
                this.sendTimeResponse();
            }
        })
    }
}

module.exports = {ArduinoBoard, ArduinoUtils};