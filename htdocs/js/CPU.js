import { Memory } from './Memory.js';
import { CPUDisplay } from "./CPUDisplay.js";

export class CPU extends EventTarget {
    static MILLISECONDS_PER_CLOCK_TICK = 1;

    static dec2hexByte(dec) {
        return dec.toString(16).padStart(2, '0').toUpperCase();
    }

    constructor(options) {
        super(); // Required to implement EventTarget

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
        }

        this.addEventListener('tick', () => {
            this.ticksAvailable++;
            this.tickCount++;
        });

        this.addEventListener('fetchAndExecute', () => {
            let ticksRequired, func;
            // We need to know how many ticks does the instruction requires 
            [ticksRequired, func] = this.fetch();
            // console.log('ticksRequired: ' + ticksRequired);
            // Wait until that many ticks are available, and execute the instruction
            this.waitAndDo(ticksRequired, () => {
                func();
                this.updateDisplay();
            }).then(() => {
                // Once the instruction has completed, schedule the next fetch and execute
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

    /**
     * Fetches an instruction, and the number of clock cycles required to execute it
     * 
     * @returns [Number clock cycles required to execute instructions, instruction closure]
     */
    fetch() {
        const opcode = this.memory.readByte(this.registers.pc);
        let f;

        switch (opcode) {
            case 0xA2: // LDA immediate
                f = () => {                    
                    console.log('LDA %');

                    const operand = this.memory.readByte(this.registers.pc + 1);
                    console.log(`Operand: ${CPU.dec2hexByte(operand)}`);

                    this.registers.ac = operand;
                    this.updateFlags(operand);

                    this.registers.pc += 2;
                }
                return [2, f]; // [ticks, func]
            
            case 0x4C: // JMP
                f = () => {
                    const low = this.memory.readByte(this.registers.pc + 1);
                    const high = this.memory.readByte(this.registers.pc + 2);

                    const jumpAddress = (high << 8) + low;

                    console.log(`jump to address: ${CPU.dec2hexByte(jumpAddress)}`)

                    // Do the jump
                    this.registers.pc = jumpAddress;
                }
                return [3, f]; // [ticks, func]
            
            default: 
                console.log(`Unknown opcode '${CPU.dec2hexByte(opcode)}' at PC: ${this.registers.pc} `);
        }
    }

    /**
     * 
     * Updates the 6502 SR register flags 
     * 
     */
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
        }, CPU.MILLISECONDS_PER_CLOCK_TICK);
    }

    stop() {
        console.log('Stop');
        this.isRunning = false;
        clearTimeout(this.clockTimeout);
    }

    /**
     * Wait until {ticks} ticks are available, then execute {instruction} 
     *
     * @param {*} ticks 
     * @param {*} instruction 
     * @returns Promise
     */
    waitAndDo(ticks, instruction) {
        return this.waitForTicks(ticks).then(instruction);
    }

    /**
     * 
     * Waits until the number of ticks are available
     * 
     * @param {Number} ticksRequired 
     * @param {Function} resolve 
     * @returns Promise
     */
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

    /**
     * the ZeroTimeoutQueue is much faster than setTimeout(fn, 0)
     */
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

    /**
     * Add a closure to the queue to be run as soon as possible
     * 
     * @param {function} fn 
     */
    newZeroTimeout(fn) {
        // console.log('pushed fn to timeoutsQueue:', fn);
        this.timeoutsQueue.push(fn);
        window.postMessage('zeroTimeoutPushed', "*");
    }

    /**
     * Update the display of the CPU (if there is one attached)
     */
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