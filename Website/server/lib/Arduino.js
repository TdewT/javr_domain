const {SerialPort, ReadlineParser} = require("serialport");
const {arduinoBoards, serverList} = require("@server-lib/globals.js");
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
    currEvent;
    sensors = {};

    constructor({
                    name: name,
                    serialPort: serialPort,
                    baudRate: baudRate,
                    sensors: sensors,
                }) {
        this.name = name;
        this.serialPort = new SerialPort({
            path: serialPort.path,
            baudRate: baudRate
        });

        for (const sensor of sensors) {
            this.sensors[sensor] = null;
        }
    }

    startCommunication() {
        const parser = this.serialPort.pipe(new ReadlineParser({delimiter: '\n'}));

        this.serialPort.on("error", (err) => {
           customLog(this.name, err)
        });

        parser.on('data', (data) => {
            data = data.trim();
            // If message received is status update
            const isStatusUpdate = data === ArduinoUtils.Events.STATUS_UPDATE;
            const isCurrStatusUpdate = this.currEvent === ArduinoUtils.Events.STATUS_UPDATE;
            if (isCurrStatusUpdate || isStatusUpdate){
                // Set currently receiving message
                if (!isCurrStatusUpdate) {
                    this.currEvent = ArduinoUtils.Events.STATUS_UPDATE;
                }
                // Clear current event on message end
                else if (data === ArduinoUtils.Events.MESSAGE_END) {
                    this.currEvent = null;
                }
                // Filter out the header
                else if(!isStatusUpdate) {
                    const ServerInstance = require("@server-lib/ServerInstance.cjs");
                    this.sensors = JSON.parse(data);
                    if (ServerInstance.websiteIO){
                        SocketEvents.statusResponse(ServerInstance.websiteIO);
                    }
                }
            }

            // If message is
        })
    }
}

module.exports = {ArduinoBoard, ArduinoUtils};