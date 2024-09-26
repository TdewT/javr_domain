const {SerialPort, ReadlineParser} = require("serialport");
const {arduinoBoards} = require("@server-lib/globals.js");
const {customLog} = require("@server-utils/custom-utils.cjs");
const SocketEvents = require("@server-lib/SocketEvents.cjs");
const {usb} = require("usb");
const ServerInstance = require("@server-lib/ServerInstance.cjs");

class ArduinoUtils {
    static logName = "Arduino_Utils";

    static Events = {
        CONNECT: "connect",
        MESSAGE_END: "message-end",
        STATUS_UPDATE: "status-update",
        TIME_UPDATE_REQUEST: "time-update-request",
        TIME_UPDATE_RESPONSE: "time-update-response",
        MESSAGE_END: "message-end",
    };

    static registerBoards(arduinos) {
        // Search for already connected devices
        SerialPort.list().then(ports => {
            for (const port of ports) {
                const arduino = arduinos[port.productId];
                if (arduino) {
                    const board = new ArduinoBoard(Object.assign({}, arduino, {serialPort: port, id: port.productId}));
                    arduinoBoards.push(board);
                    customLog(this.logName, `Found board ${board.name} on: ${port.path}`);
                    board.startListening();
                    board.serialPort.write(ArduinoUtils.Events.CONNECT + ArduinoUtils.Events.MESSAGE_END, (err) => {
                        if (err) {
                            customLog(board.name, "Error sending connect event")
                        }
                    })
                }
            }
        });
    }

    static initialiseBoards(arduinos) {
        // Add boards that are already connected
        this.registerBoards(arduinos);


        // Handle new boards
        usb.on('attach', (device) => {
            this.registerBoards(arduinos);
        });
        // Handle disconnects
        usb.on('detach', (device) => {
            const productId = device.deviceDescriptor.idProduct.toString(16);

            for (const arduino of arduinoBoards) {
                if (arduino.id === productId) {
                    arduinoBoards.splice(arduinoBoards.indexOf(arduino), 1);
                }
            }

            this.registerBoards(arduinos);
        })
    }
}

class ArduinoBoard {
    sensors = {};

    constructor({
                    name,
                    serialPort,
                    baudRate,
                    productId
                }) {
        this.name = name;
        this.id = productId;
        this.serialPort = new SerialPort({
            path: serialPort.path,
            baudRate: baudRate
        });
    }

    sendTimeResponse() {
        // Import events
        const Events = ArduinoUtils.Events;

        const time = Date.now();
        const message = Events.TIME_UPDATE_RESPONSE + time + Events.MESSAGE_END;
        this.serialPort.write(message, (err) => {
            if (err) {
                customLog(this.name, `Error sending data: ${err}`)
            }
        });
    }

    startListening() {
        // Import events
        const Events = ArduinoUtils.Events;

        // Create pipe for input from arduino
        const parser = this.serialPort.pipe(new ReadlineParser({delimiter: '\n'}));

        this.serialPort.on("error", (err) => {
            customLog(this.name, err)
        });

        parser.on('data', (data) => {

            // Debug stuff
            // console.log(`ARDUINO BOARD ${this.name} SAYS: ${data}`);

            // Get rid of unwanted chars
            data = data.trim();
            // Check if message was sent correctly
            if (!data.endsWith(Events.MESSAGE_END)) {
                customLog(this.name, "Error reading message");
            }
            else {
                // Remove message end
                data = data.replace(Events.MESSAGE_END, "")
            }

            // If message is status update
            if (data.startsWith(Events.STATUS_UPDATE)) {
                // Remove header
                data = data.replace(Events.STATUS_UPDATE, "");

                // Update data and send update
                const ServerInstance = require("@server-lib/ServerInstance.cjs");
                try {
                    // Parse data
                    this.sensors = JSON.parse(data);

                    // Send update
                    if (ServerInstance.websiteIO) {
                        SocketEvents.statusResponse(ServerInstance.websiteIO);
                    }
                }
                catch (err) {
                    customLog(this.name, `Error parsing data: ${err}`)
                }
            }

            else if (data.startsWith(Events.TIME_UPDATE_REQUEST)) {
                this.sendTimeResponse();
            }
        })
    }
}

module.exports = {ArduinoBoard, ArduinoUtils};