import { Memory } from './Memory.mjs';
import { CPUDisplay } from "./CPUDisplay.mjs";

export class CPU extends EventTarget {
    static FAST_FORWARD_CYCLE_BATCH_SIZE = 9973;

    static dec2hexByte(dec) {
        return dec.toString(16).padStart(2, '0').toUpperCase();
    }

    constructor(options) {
        super(); // Required to implement EventTarget

        this.initRegisters();
        this.initMemory();
        this.initZeroTimeoutQueue();

        this.isRunning = false;
        this.isFastForwarding = false;
        this.tickCount = 0;
        this.subCycleInstructions = [];

        this.display = undefined;

        if (options && options.displayContainer) {
            this.display = document.createElement('cpu-display');
            this.display.cpu = this;
            this.display.memory = this.memory;

            options.displayContainer.append(this.display);
        }

        return this;
    }

    doTick() {
        this.tickCount++;
        this.processTick();

        if(this.isFastForwarding) {
            for(let i = 0; i < CPU.FAST_FORWARD_CYCLE_BATCH_SIZE; i++) {
                this.tickCount++;
                this.processTick();
            }

            this.updateDisplay();

            // Do another batch
            this.newZeroTimeout(this.doTick.bind(this));            
        } else {
            this.updateDisplay();

            if(this.isRunning) {
                // setTimeout(this.doTick.bind(this), 0);
                this.newZeroTimeout(this.doTick.bind(this));
            }    
        }

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
                b: 1,
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

    /**
     * Do something in response to a clock tick
     */
    processTick() {
        if(this.subCycleInstructions.length) {
            // Do the next sub-instruction
            const subCycleInstruction = this.subCycleInstructions.shift();
            subCycleInstruction();
        } else {
            this.fetchAndExecute();
            this.registers.pc++;
        }
    }

    boot() {
        this.updateDisplay();
    }

    /**
     * Fetches an instruction and executes it
     */
    fetchAndExecute() {
        const opcode = this.memory.readByte(this.registers.pc);

        switch (opcode) {
            /**
             * This isn't actually what a 6502 does for BRK, but will do for now. 
             * Just serves as a way to stop the program
             */
            case 0x00: // BRK
                // console.log('BRK %');

                // this.subCycleInstructions.push(() => {
                this.stop();
                // });
                break;

            case 0x18: // CLC -- Clear carry flag
                // console.log('ADC %');
                this.subCycleInstructions.push(() => {
                    this.registers.sr.c = 0;
                });
            break;

                
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
                // console.log('ADC %');
                this.subCycleInstructions.push(() => {
                    const operand = this.popByte();
                    // console.log(`Operand: ${CPU.dec2hexByte(operand)}`);

                    this.registers.ac += operand;

                    if(this.registers.ac > 0xFF) {
                        this.registers.ac -= 0x100;
                        this.registers.sr.c = 1;
                    } else {
                        this.registers.sr.c = 0;
                    }
            
                    this.updateFlags(this.registers.ac);
                });

                break;


            /**
             * When instruction LDA is executed by the microprocessor, data is transferred from 
             * memory to the accumulator and stored in the accumulator.
             * 
             * LDA affects the contents of the accumulator, does not affect the carry or 
             * overflow flags; sets the zero flag if the accumulator is zero as a result of 
             * the LDA, otherwise resets the zero flag; sets the negative flag if bit 7 of 
             * the accumulator is a 1, other­wise resets the negative flag.
             */
            case 0xA9: // LDA immediate
                // console.log('LDA %');
                this.subCycleInstructions.push(() => {

                    const operand = this.popByte();
                    // console.log(`Operand: ${CPU.dec2hexByte(operand)}`);

                    this.registers.ac = operand;
                    this.updateFlags(operand);
                });

                break;
            
            /**
             * This instruction establishes a new value for the program counter.
             * 
             * It affects only the program counter in the microprocessor and affects 
             * no flags in the status register.
             */
            case 0x4C: // JMP, 3 cycles
                // console.log('JMP');
                (() => {
                    let lowByte, highByte;
                    this.subCycleInstructions.push(() => {
                        lowByte = this.popByte();
                    });
    
                    this.subCycleInstructions.push(() => {
                        highByte = this.popByte();

                        this.registers.pc = lowByte + (highByte << 8);
                    });
                })();
                break;

            case 0x8D: // STA #, 4 cycles
                (() => {
                    let lowByte, highByte;

                    this.subCycleInstructions.push(() => {
                        lowByte = this.popByte();
                    });
    
                    this.subCycleInstructions.push(() => {
                        highByte = this.popByte();
                    });

                    this.subCycleInstructions.push(() => {
                        const addr = lowByte + (highByte << 8);
                        // console.log(`STA ${this.registers.ac} to ${addr}`);
                        this.memory.writeByte(addr, this.registers.ac);
                        this.registers.pc++;
                    });

                })();
            break;

            case 0xAA: // TAX transfer acc to x
                this.subCycleInstructions.push(() => {
                    this.registers.x = this.registers.ac;

                    this.updateFlags(this.registers.x);
                });
            break;

            case 0xE8: // INX - Increment x
                this.subCycleInstructions.push(() => {
                    this.registers.x++;

                    this.updateFlags(this.registers.x);
                });
            break;

            
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
     * 
     * Shouldn't use this, should use two popBytes, because each one 
     * takes a clock cycle
     */
    // popWord() {
    //     const lowByte = this.popByte();
    //     const highByte = this.popByte();
         
    //     return lowByte + (highByte << 8);
    // }

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
        // console.log('Step');

        if(this.isRunning) {
            // Already running
            return;
        }

        this.doTick();
        this.updateDisplay();

        if(this.display) {
            this.display.cps = '';
        }
    }

    steps(n) {
        for(let i = 0; i < n; i++) {
            this.doTick();
        }
        this.updateDisplay();
    }

    start() {
        // console.log('Start');
        if(this.isRunning) {
            // Already running
            return;
        }

        this.startProfiling();

        this.isRunning = true;
        this.doTick();   
    }

    fastForward() {
        this.isFastForwarding = true;
        this.start();
    }

    stop() {
        // console.log('Stop');
        this.stopProfiling();
        this.isRunning = false;
        this.isFastForwarding = false;
        this.updateDisplay();
    }


    /**
     * the ZeroTimeoutQueue is much faster than setTimeout(fn, 0)
     */
    initZeroTimeoutQueue() {
        this.timeoutsQueue = [];

        if(typeof window !== 'undefined') {
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

    }

    /**
     * Add a closure to the queue to be run as soon as possible
     * 
     * @param {function} fn 
     */
    newZeroTimeout(fn) {
        // console.log('pushed fn to timeoutsQueue:', fn);
        this.timeoutsQueue.push(fn);

        if(typeof window !== 'undefined') {
            window.postMessage('zeroTimeoutPushed', "*");

        } else {
            setTimeout(fn, 0);
        }
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

    startProfiling() {
        this.startTime = performance.now();
        this.startTicks = this.tickCount;

        this.profileUpdateIntervalTimer = setInterval(() => {
            this.updateProfile();
        }, 250);

    }

    updateProfile() {
        const timeTaken = (performance.now() - this.startTime) / 1000;
        const ticksProcessed = this.tickCount - this.startTicks;
        if(this.display) {
            this.display.cps = Math.round(ticksProcessed / timeTaken);
        }
        this.updateDisplay();
    }
    
    stopProfiling() {
        clearInterval(this.profileUpdateIntervalTimer);
    }
}