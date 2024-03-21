import { Memory } from './Memory.js';

export class CPU {
    static TICKS_PER_CLOCK = 100;

    static dec2hexByte(dec) {
        return dec.toString(16).padStart(2, '0').toUpperCase();
    }

    constructor() {
        this.initRegisters();
        this.initMemory();

        return this;
    }

    initRegisters() {
        const registers = {
            pc: 0,
            ac: 0,
            x: 0,
            y: 0,
            sp: 0,
            sr: {
                n: 0,
                v: 0,
                b: 0,
                d: 0,
                i: 0,
                z: 0,
                c: 0
            }
        }

        for (const property in registers) {
            this[property] = registers[property];
        }
    }

    initMemory() {
        this.memory = new Memory;
    }

    fetchAndExecute() {
        const opcode = this.memory.readByte(this.pc);
        this.pc++;

        console.log(`Got opcode '${CPU.dec2hexByte(opcode)}' from PC ${this.pc}`);

        this.execute(opcode);
    }

    execute(opcode) {
        switch(opcode) {
            case 0xA2: // LDA immediate
                const operand = this.memory.readByte(this.pc);
                this.pc++;
                this.ac = operand;
                this.updateFlags(operand);
                break;

            default:
                alert(`Unknown opcode '${opcode}'`);
        }
    }

    updateFlags(operand) {
        // TODO: write these as a batch
        if(operand == 0) { // Zero flag (Z)
            this.sr.z = 1;
        } else {
            this.sr.z = 0;
        }

        if(!!(operand & (1<<7))) { // Negative flag (N). Bit 7 of operand is 1
            this.sr.n = 1;
        } else {
            this.sr.n = 0;
        }
    }

    step() {
        console.log('Step');
    }




}