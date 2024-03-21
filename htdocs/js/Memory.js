export class Memory {
    // static MEM_SIZE = 16 * 1024;
    static MEM_SIZE = 128;


    constructor() {
        this.initMemory();
    }


    initMemory() {
        this._mem = new Array(Memory.MEM_SIZE).fill(0);
    }

    readByte(location) {
        return this._mem[location];
    }

    writeByte(location, value) {
        this._mem[location] = value;
    }
    
}