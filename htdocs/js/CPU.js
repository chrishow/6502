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
            this.display.memory = this.memory;

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
                this.registers.pc++;
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
            /**
             * This isn't actually what a 6502 does for BRK, but will do for now. 
             * Just serves as a way to stop the program
             */
            case 0x00: // BRK
                f = () => {
                    this.stop();
                };
                return [1, f];

            /**
             * This instruction adds the value of memory and carry from the previous operation 
             * to the value of the accumulator and stores the result in the accumulator.
             * 
             * This instruction affects the accumulator; sets the carry flag when the sum of
             * a binary add exceeds 255 or when the sum of a decimal add exceeds 99, 
             * otherwise carry is reset. The overflow flag is set when the sign or bit 7 
             * is changed due to the result exceeding +127 or -128, otherwise overflow is reset. 
             * The negative flag is set if the accumulator result contains bit 7 on, otherwise 
             * the negative flag is reset. The zero flag is set if the accumulator result is 0, 
             * otherwise the zero flag is reset.
             */
            case 0x69: // ADC - Add Memory to Accumulator with Carry, immediate
            f = () => {                    
                console.log('ADC %');

                const operand = this.popByte();
                console.log(`Operand: ${CPU.dec2hexByte(operand)}`);

                this.registers.ac += operand;

                if(this.registers.ac > 0xFF) {
                    this.registers.ac -= 0xFF;
                    this.registers.sr.c = 1;
                } else {
                    this.registers.sr.c = 0;
                }
        
                this.updateFlags(this.registers.ac);

            };
            return [2, f]; // [ticks, func]


            /**
             * When instruction LDA is executed by the microprocessor, data is transferred from 
             * memory to the accumulator and stored in the accumulator.
             * 
             * LDA affects the contents of the accumulator, does not affect the carry or 
             * overflow flags; sets the zero flag if the accumulator is zero as a result of 
             * the LDA, otherwise resets the zero flag; sets the negative flag if bit 7 of 
             * the accumulator is a 1, other­wise resets the negative flag.
             */
            case 0xA2: // LDA immediate
                f = () => {                    
                    console.log('LDA %');

                    operand = this.popByte();
                    console.log(`Operand: ${CPU.dec2hexByte(operand)}`);

                    this.registers.ac = operand;
                    this.updateFlags(operand);

                };
                return [2, f]; // [ticks, func]
            
            /**
             * This instruction establishes a new valne for the program counter.
             * 
             * It affects only the program counter in the microprocessor and affects 
             * no flags in the status register.
             */
            case 0x4C: // JMP
                f = () => {
                    const jumpAddress = this.popWord();

                    console.log(`jump to address: ${CPU.dec2hexByte(jumpAddress)}`)

                    // Do the jump
                    this.registers.pc = jumpAddress;
                };
                return [3, f]; // [ticks, func]
            
            default: 
                console.log(`Unknown opcode '${CPU.dec2hexByte(opcode)}' at PC: ${this.registers.pc} `);
        }
    }

    /**
     * Reads a byte and increments PC
     */
    popByte() {
        return this.memory.readByte(this.registers.pc++);
    }

    /**
     * Reads a word in little-endian format
     */
    popWord() {
        const lowByte = this.popByte();
        const highByte = this.popByte();
         
        return lowByte + (highByte << 8);
    }

    /**
     * 
     * Updates the 6502 SR register flags 
     * 
     */
    updateFlags(result) {
        if (result == 0) { // Zero flag (Z)
            this.registers.sr.z = 1;
        } else {
            this.registers.sr.z = 0;
        }

        if (!!(result & (1 << 7))) { // Negative flag (N). Bit 7 of operand is 1
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
            this.display.memory = this.memory;
        }
    }
}