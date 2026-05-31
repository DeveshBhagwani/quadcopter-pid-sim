export class SerialBridge {
    constructor() {
        this.port = null;
        this.reader = null;
        this.active = false;
        
        // RC Data targets normalized (-1.0 to 1.0 for angles, 0 to 15 for Z)
        this.rcData = {
            active: false,
            z: 5.0,
            roll: 0.0,
            pitch: 0.0,
            yaw: 0.0
        };
        
        this.decoder = new TextDecoderStream();
        this.buffer = "";
    }

    async connect() {
        if (!('serial' in navigator)) {
            console.error('Web Serial API is not supported in this browser.');
            alert('Web Serial API is not supported in this browser. Try Chrome or Edge.');
            return;
        }

        try {
            this.port = await navigator.serial.requestPort();
            // Defaulting to 115200 baud rate which is common for RC/Arduino
            await this.port.open({ baudRate: 115200 });
            this.active = true;
            this.rcData.active = true;
            console.log('Serial port opened successfully');
            
            this.readLoop();
        } catch (error) {
            console.error('There was an error opening the serial port:', error);
            this.active = false;
            this.rcData.active = false;
        }
    }

    async disconnect() {
        this.active = false;
        this.rcData.active = false;
        if (this.reader) {
            await this.reader.cancel();
        }
        if (this.port) {
            await this.port.close();
            this.port = null;
        }
        console.log('Serial port closed');
    }

    async readLoop() {
        while (this.port.readable && this.active) {
            const readableStreamClosed = this.port.readable.pipeTo(this.decoder.writable);
            this.reader = this.decoder.readable.getReader();

            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) {
                        break; // Reader has been canceled.
                    }
                    if (value) {
                        this.processChunk(value);
                    }
                }
            } catch (error) {
                console.error('Error reading from serial port:', error);
            } finally {
                this.reader.releaseLock();
            }
        }
    }

    processChunk(chunk) {
        this.buffer += chunk;
        const lines = this.buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        this.buffer = lines.pop();

        // Process the latest complete line
        if (lines.length > 0) {
            const latestLine = lines[lines.length - 1].trim();
            this.parseRCData(latestLine);
        }
    }

    parseRCData(line) {
        // Expected format: "throttle,roll,pitch,yaw"
        // Example: "0.5,0.1,-0.1,0.0"
        const parts = line.split(',');
        if (parts.length === 4) {
            const throttle = parseFloat(parts[0]);
            const roll = parseFloat(parts[1]);
            const pitch = parseFloat(parts[2]);
            const yaw = parseFloat(parts[3]);

            if (!isNaN(throttle) && !isNaN(roll) && !isNaN(pitch) && !isNaN(yaw)) {
                // Map throttle (0 to 1) to Target Z (0 to 15m)
                this.rcData.z = throttle * 15.0;
                
                // Map roll/pitch/yaw (-1 to 1) to radians (-1 to 1)
                this.rcData.roll = roll;
                this.rcData.pitch = pitch;
                this.rcData.yaw = yaw;
            }
        }
    }
}
