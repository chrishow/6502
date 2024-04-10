export class Memory {
    static MEM_SIZE = 64 * 1024;

    constructor() {
        this.initMemory();

        return this;
    }


    initMemory() {
        this._mem = new Uint8Array(Memory.MEM_SIZE);
        this._patches = [];
    }

    readByte(location) {
        const foundPatch = this._patches.findLastIndex((patch) => {
            if(location >= patch.start && location <= patch.end) {
                return true;
            }
        });

        if(foundPatch > -1) {
            return this._patches[foundPatch].readCallback(location);
        } else {
            return this._mem[location];
        }
    }

    writeByte(location, value) {
        const foundPatch = this._patches.findLastIndex((patch) => {
            if(location >= patch.start && location <= patch.end) {
                return true;
            }
        });

        if(foundPatch > -1) {
            this._patches[foundPatch].writeCallback(location, value);
        } else {
            this._mem[location] = value;
        }
    }

    hexLoad(start, hexString) {
        const bytes = hexString.split(' ');
        bytes.forEach(byte => {
            this.writeByte(start++, parseInt(byte, 16));
        });
    }

    addPatch(patch) {
        this._patches.push(patch);
    }
    
}