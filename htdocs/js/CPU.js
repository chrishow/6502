import { Memory } from './Memory.js';
import { CPUDisplay } from "./CPUDisplay.js";

export class CPU extends EventTarget {
    static TICKS_PER_CLOCK = 100;

    static dec2hexByte(dec) {
        return dec.toString(16).padStart(2, '0').toUpperCase();
    }

    constructor(options) {
        super();
        this.initRegisters();
        this.initMemory();

        this.display = undefined;

        if(options.displayContainer) {
            this.display = document.createElement('cpu-display');
            this.display.cpu = this;

            options.displayContainer.append(this.display);
            this.addEventListener('update', () => this.updateDisplay());
        }

        this.addEventListener('tick', () => {
            this.fetchAndExecute();
            this.updateDisplay();
        });


        return this;
    }

    initRegisters() {
        this.registers = {
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
    }

    initMemory() {
        this.memory = new Memory;
    }

    fetchAndExecute() {
        const opcode = this.memory.readByte(this.registers.pc);

        console.log(`Got opcode  '${CPU.dec2hexByte(opcode)}' from PC ${this.registers.pc}`);
        this.registers.pc++;
        this.execute(opcode);
    }

    execute(opcode) {
        switch(opcode) {
            case 0xA2: // LDA immediate
                console.log('LDA %');
                const operand = this.memory.readByte(this.registers.pc);
                // console.log(`Operand: ${CPU.dec2hexByte(operand)}`);
                this.registers.pc++;
                this.registers.ac = operand;
                this.updateFlags(operand);
                break;

            case 0x4C: // JMP
                console.log('JMP');
                // NEED TO WAIT HERE
                const low = this.memory.readByte(this.registers.pc);
                // console.log(`Low byte: ${CPU.dec2hexByte(low)}`);
                this.registers.pc++;
                // NEED TO WAIT HERE
                const high = this.memory.readByte(this.registers.pc);
                // console.log(`Low byte: ${CPU.dec2hexByte(high)}`);

                const jumpAddress = (high << 8) + low;

                // console.log(`jumpAddress: ${CPU.dec2hexByte(jumpAddress)}`)
                
                // NEED TO WAIT HERE
                // Do the jump
                this.registers.pc = jumpAddress;
                break;
                

            default:
                alert(`Unknown opcode '${opcode}'`);
        }
    }

    updateFlags(operand) {
        if(operand == 0) { // Zero flag (Z)
            this.registers.sr.z = 1;
        } else {
            this.registers.sr.z = 0;
        }

        if(!!(operand & (1<<7))) { // Negative flag (N). Bit 7 of operand is 1
            this.registers.sr.n = 1;
        } else {
            this.registers.sr.n = 0;
        }
    }

    step() {
        console.log('Step');
        this.dispatchEvent(new CustomEvent('tick'));
    }

    start() {
        console.log('Start');
        if(this.clockTimeout) {
            clearTimeout(this.clockTimeout);
        }

        this.clockTimeout = setInterval(() => {
            this.dispatchEvent(new CustomEvent('tick'));
        }, CPU.TICKS_PER_CLOCK);
    }

    stop() {
        console.log('Stop');
        clearTimeout(this.clockTimeout);
    }

    

    updateDisplay() {
        if(this.display) {
            // Make a new copy of the registers to pass to display
            const registers = {...this.registers};

            for(const flag in this.registers.sr) {
                registers.sr[flag] = this.registers.sr[flag];
            }
        
            this.display.registers = registers;
        }
    }
}