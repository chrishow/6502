import { Memory } from './Memory.js';
import { CPUDisplay } from "./CPUDisplay.js";

export class CPU extends EventTarget {
    static TICKS_PER_CLOCK = 1;

    static dec2hexByte(dec) {
        return dec.toString(16).padStart(2, '0').toUpperCase();
    }

    constructor(options) {
        super();
        this.initRegisters();
        this.initMemory();
        this.initZeroTimeoutQueue();

        this.ticksAvailable = 0;
        this.isRunning = false;
        this.tickCount = 0;

        this.display = undefined;

        if (options.displayContainer) {
            this.display = document.createElement('cpu-display');
            this.display.cpu = this;

            options.displayContainer.append(this.display);
            // this.addEventListener('update', () => this.updateDisplay());
        }

        this.addEventListener('tick', () => {
            this.ticksAvailable++;
            this.tickCount++;
        });

        this.addEventListener('fetchAndExecute', () => {
            const ticksRequired = this.fetch();
            console.log('ticksRequired: ' + ticksRequired);
            this.waitAndDo(ticksRequired, () => {
                this.fetchAndExecute();
                this.updateDisplay();
            }).then(() => {
                this.dispatchEvent(new CustomEvent('fetchAndExecute'));
            });    
        })        

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

    boot() {
        this.dispatchEvent(new CustomEvent('fetchAndExecute'));
    }

    fetchAndExecute() {
        const opcode = this.memory.readByte(this.registers.pc);

        console.log(`Got opcode  '${CPU.dec2hexByte(opcode)}' from PC ${this.registers.pc}`);
        this.registers.pc++;
        this.execute(opcode);
    }


    fetch() {
        const opcode = this.memory.readByte(this.registers.pc);

        switch (opcode) {
            case 0xA2: // LDA immediate
                return 2; // ticks
            
            case 0x4C: // JMP
                return 3; // ticks
            
            default: 
                console.log(`Unknown opcode '${opcode}' at PC: ${this.registers.pc} `);
        }
    }

    execute(opcode) {
        switch (opcode) {
            case 0xA2: // LDA immediate
                    console.log('LDA %');
                    const operand = this.memory.readByte(this.registers.pc++);
                    console.log(`Operand: ${CPU.dec2hexByte(operand)}`);

                    this.registers.ac = operand;
                    this.updateFlags(operand);
                break;

            case 0x4C: // JMP
                    console.log('JMP');

                    const low = this.memory.readByte(this.registers.pc++);
                    const high = this.memory.readByte(this.registers.pc);

                    const jumpAddress = (high << 8) + low;

                    console.log(`jump to address: ${CPU.dec2hexByte(jumpAddress)}`)

                    // Do the jump
                    this.registers.pc = jumpAddress;
                break;


            default:
                alert(`Unknown opcode '${CPU.dec2hexByte(opcode)}', PC: ${this.registers.pc}`);
        }
    }

    updateFlags(operand) {
        if (operand == 0) { // Zero flag (Z)
            this.registers.sr.z = 1;
        } else {
            this.registers.sr.z = 0;
        }

        if (!!(operand & (1 << 7))) { // Negative flag (N). Bit 7 of operand is 1
            this.registers.sr.n = 1;
        } else {
            this.registers.sr.n = 0;
        }
    }

    step() {
        console.log('Step');
        this.dispatchEvent(new CustomEvent('tick'));
        this.updateDisplay(); // To show new tick count
    }

    start() {
        console.log('Start');
        if (this.clockTimeout) {
            clearTimeout(this.clockTimeout);
        }

        this.clockTimeout = setInterval(() => {
            this.isRunning = true;
            this.dispatchEvent(new CustomEvent('tick'));
        }, CPU.TICKS_PER_CLOCK);
    }

    stop() {
        console.log('Stop');
        this.isRunning = false;
        clearTimeout(this.clockTimeout);
    }

    waitAndDo(ticks, instruction) {
        return this.waitForTicks(ticks).then(instruction);
    }

    waitForTicks(ticksRequired, resolve) {
        return new Promise((resolve, reject) => {
            const checkForTick = () => {
                if (this.ticksAvailable >= ticksRequired) {
                    // console.log('Tick available! 😄');
                    this.ticksAvailable -= ticksRequired;
                    resolve();
                } else {
                    if(this.isRunning) {
                        this.newZeroTimeout(checkForTick);
                    } else {
                        // Give the processor a break 😂
                        setTimeout(() => {
                            this.newZeroTimeout(checkForTick);
                        }, 100);
                    }
                    return false;
                }
            };

            this.newZeroTimeout(checkForTick);
        });
    }

    initZeroTimeoutQueue() {
        this.timeoutsQueue = [];

        window.addEventListener("message", (event) =>  {
            if (event.source == window && event.data == 'zeroTimeoutPushed') {
                event.stopPropagation();
                if (this.timeoutsQueue.length > 0) {
                    var fn = this.timeoutsQueue.shift();
                    fn();
                }
            }
        }, true);
    }

    newZeroTimeout(fn) {
        // console.log('pushed fn to timeoutsQueue:', fn);
        this.timeoutsQueue.push(fn);
        window.postMessage('zeroTimeoutPushed', "*");
    }

    updateDisplay() {
        if (this.display) {
            // Make a new copy of the registers to pass to display
            const registers = { ...this.registers };

            for (const flag in this.registers.sr) {
                registers.sr[flag] = this.registers.sr[flag];
            }

            this.display.registers = registers;
            this.display.ticks = this.tickCount;
        }
    }
}