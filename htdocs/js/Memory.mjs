export class Memory {
    // static MEM_SIZE = 16 * 1024;
    static MEM_SIZE = 128;


    constructor() {
        this.initMemory();

        return this;
    }


    initMemory() {
        // this._mem = new Array(Memory.MEM_SIZE).fill(0);
        this._mem = new Uint8Array(Memory.MEM_SIZE);
    }

    readByte(location) {
        return this._mem[location];
    }

    writeByte(location, value) {
        this._mem[location] = value;
    }

    hexLoad(start, hexString) {
        const bytes = hexString.split(' ');
        // console.log(bytes);
        bytes.forEach(byte => {
            this.writeByte(start++, parseInt(byte, 16));
        });
    }
    
}