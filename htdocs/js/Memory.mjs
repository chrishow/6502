export class Memory {
    static MEM_SIZE = 64 * 1024;

    constructor() {
        this.initMemory();

        // Patch missing Array.findLastIndex
        if (!Array.prototype.findLastIndex) {
            Array.prototype.findLastIndex = function (callback, thisArg) {
                for (let i = this.length - 1; i >= 0; i--) {
                    if (callback.call(thisArg, this[i], i, this)) return i;
                    }
                return -1;
            };
        }

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
            if(typeof this._patches[foundPatch].writeCallback == 'function') {
                this._patches[foundPatch].writeCallback(location, value);
            }
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


    async binaryLoad(start, url) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        // console.log(bytes);
        
        bytes.forEach(byte => {
            // console.log(`start: ${start.toString(16).padStart(4, '0').toUpperCase()}, byte: ${byte.toString(16).padStart(4, '0').toUpperCase()}`);
            this.writeByte(start++, byte);
        });
        console.log(`Loaded ${bytes.length} bytes from '${url}'`);
    }

    addPatch(patch) {
        this._patches.push(patch);
    }
    
}