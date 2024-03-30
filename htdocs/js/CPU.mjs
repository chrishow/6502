import { Memory } from './Memory.mjs';
import { CPUDisplay } from "./CPUDisplay.mjs";
import { InstructionDecoder } from './InstructionDecoder.mjs';

export class CPU {
    static FAST_FORWARD_CYCLE_BATCH_SIZE = 9973;

    static dec2hexByte(dec) {
        return dec.toString(16).padStart(2, '0').toUpperCase();
    }

    static dec2hexWord(dec) {
        return dec.toString(16).padStart(4, '0').toUpperCase();
    }

    constructor(options) {
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
            a: 0,
            x: 0,
            y: 0,
            sp: 0xFF,
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
        let instruction, mode;
        const opcode = this.memory.readByte(this.registers.pc);
        [instruction, mode] = InstructionDecoder.decodeOpcode(opcode);
        console.log(`instruction: ${instruction}, mode: ${mode}`);


        switch (instruction) {
            case 'ADC': // Add Memory to Accumulator with Carry
                (() => {
                    let operand = {}; // We use an object, so it is passed by reference

                    if(mode !== '#') {
                        this.getOperand(mode, operand);
                    }

                    this.queueStep(() => {
                        if(mode === '#') {
                            this.getOperand(mode, operand);
                            this.registers.a += operand.value;
                        } else {
                            this.registers.a += this.memory.readByte(operand.value);
                        }

    
                        if(this.registers.a > 0xFF) {
                            this.registers.a -= 0x100;
                            this.registers.sr.c = 1;
                        } else {
                            this.registers.sr.c = 0;
                        }
                
                        this.updateFlags(this.registers.a);
                    });

                })();
                break;

            case 'BNE': // branch on Z = 0, operand is two's complement
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.z !== 0) {
                        console.log(`BNE,  z not 0 but ${CPU.dec2hexByte(this.registers.sr.z)}`);
                        return;
                    } 

                    let newAddr = null;


                    // Operand is 2s complement
                    if (operand.value > 0x7f) { 
                        // A negative offset
                        newAddr = (this.registers.pc - (0x100 - operand.value));
                    } else {
                        // A positive offset
                        newAddr = (this.registers.pc + operand.value);
                    }

                    console.log(`BNE jump to ${CPU.dec2hexWord(newAddr)}`);
                    this.registers.pc = newAddr;
                      
                });

                break;

            case 'BRK': // This isn't actually what the 6502 does, we will just stop the program for now
                this.stop();
                break;

            case 'CLC': // Clear carry flag
                this.queueStep(() => {
                    this.registers.sr.c = 0;
                });
                break;

            case 'CPX': // Compare x, or x - operand
                (() => {
                    let operand = {}; // We use an object, so it is passed by reference

                    if(mode !== '#') {
                        this.getOperand(mode, operand);
                    }

                    this.queueStep(() => {
                        if(mode === '#') {
                            this.getOperand(mode, operand);
                        }

                        let result = this.registers.x - operand.value;
                        
                        if(result < 0) {
                            this.registers.sr.c = 0;
                        } else {
                            this.registers.sr.c = 1;
                        }

                        this.updateFlags(result);
                    });

                })();
                break;

            case 'CMP': // Compare ac, or ac - operand
                (() => {
                    let operand = {}; // We use an object, so it is passed by reference

                    if(mode !== '#') {
                        this.getOperand(mode, operand);
                    }

                    this.queueStep(() => {
                        if(mode === '#') {
                            this.getOperand(mode, operand);
                        }

                        let result = this.registers.a - operand.value;
                        
                        if(result < 0) {
                            this.registers.sr.c = 0;
                        } else {
                            this.registers.sr.c = 1;
                        }

                        this.updateFlags(result);
                    });

                })();
                break;


            case 'DEX': // Decrement X
                this.queueStep(() => {
                    this.registers.x--;
                    this.updateFlags(this.registers.x);
                });
                break;

            case 'INX': // Increment X
                this.queueStep(() => {
                    this.registers.x++;
                    this.updateFlags(this.registers.x);
                });
                break;

            case 'JMP': // Jump to address
                (() => {
                    let operand = {}; // Memory address to store ac to 

                    this.getOperand(mode, operand);

                    this.queueStep(() => {
                        // Do the jump
                        console.log(`JMP to ${CPU.dec2hexByte(operand.value)}`);
                        this.registers.pc = operand.value;
                    });

                })();
                break;

            case 'LDA': // Load into accumulator
                this.loadRegister('a', mode);
                break;

            case 'LDX': // Load into x
                this.loadRegister('x', mode);
                break;

            case 'LDY': // Load into y
                this.loadRegister('y', mode);
                break;

            case 'STA': // Store Accumulator in Memory
                this.storeRegister('a', mode);
                break;

            case 'STX': // Store x in Memory
                this.storeRegister('x', mode);
                break;

            case 'STY': // Store y in Memory
                this.storeRegister('y', mode);
                break;


            case 'TAX': // Transfer ac to x
                this.queueStep(() => {
                    this.registers.x = this.registers.a;

                    this.updateFlags(this.registers.x);
                });
                break;

            default:
                console.log(`Unknown instruction ${instruction}`);                
        }

    }

    /**
     * Load a register
     * 
     * @param {char} reg 
     */
    loadRegister(reg, mode) {
        let operand = {};
        

        if(mode === '#') { // Must do all this in one cycle
            this.queueStep(() => {
                this.getOperand(mode, operand);
                console.log(`LD${reg.toUpperCase()} immediate  ${CPU.dec2hexByte(operand.value)}, PC ${CPU.dec2hexWord(this.registers.pc)}`);
                this.registers[reg] = operand.value;
                this.updateFlags(this.registers[reg]);
            });

        } else {
            this.getOperand(mode, operand);

            this.queueStep(() => {
                console.log(`LD${reg.toUpperCase()} ${mode} from 0x${CPU.dec2hexByte(operand.value)}`);
                this.registers[reg] = this.memory.readByte(operand.value);
                this.updateFlags(this.registers[reg]);
            });    
        }
    }

    /**
     * Store a register in a memory address
     * 
     * @param {char} reg
     * @param {String} mode 
     */
    storeRegister(reg, mode) {
        let operand = {}; // Memory address to store ac to 

        this.getOperand(mode, operand);

        this.queueStep(() => {
            // Store the byte
            console.log(`ST${reg.toUpperCase()} ${CPU.dec2hexByte(this.registers[reg])} to ${CPU.dec2hexWord(operand.value)}`);
            this.memory.writeByte(operand.value, this.registers[reg]);
        });

    }



    /**
     * Gets the operand depending on the addressing mode. 
     * The operand is modified in place
     * @param {*} mode 
     * @param {*} operand 
     */
    getOperand(mode, operand) {
        switch(mode) {
            case '#': // Direct
                operand.value = this.popByte();
                break;

            case 'REL': // Relative TODO FIXME
                alert('Mode REL not implemented');
                operand.value = this.popByte();
                break;

            case 'ABS': // Absolute two byte address
                (() => {
                    let lowByte, highByte;

                    this.queueStep(() => {
                        lowByte = this.popByte();
                        // console.log(`Got lowByte: ${lowByte}`);
                    });

                    this.queueStep(() => {
                        highByte = this.popByte();
                        const addr = lowByte + (highByte << 8);

                        // console.log(`Got highByte: ${highByte}`);

                        // console.log(`Addr: ${CPU.dec2hexWord(addr)}`);

                        operand.value = addr;
                    });
                })();
                break;

            case 'ABSY': // Absolute two byte address + y
                (() => {
                    let lowByte, highByte;

                    this.queueStep(() => {
                        lowByte = this.popByte();
                        // console.log(`Got lowByte: ${lowByte}`);
                    });

                    this.queueStep(() => {
                        highByte = this.popByte();
                        const addr = lowByte + (highByte << 8) + this.registers.y;

                        // console.log(`Got highByte: ${highByte}`);

                        // console.log(`Addr: ${CPU.dec2hexWord(addr)}`);

                        operand.value = addr;
                    });
                })();
                break;

            case 'IND': // Indirect two byte address, only supported by JMP
                (() => {
                    let lowByteSrc, highByteSrc, srcAddr;
                    let lowByte, highByte;

                    // Get low byte
                    this.queueStep(() => {
                        lowByteSrc = this.popByte();
                    });

                    // get high byte
                    this.queueStep(() => {
                        highByteSrc = this.popByte();
                        srcAddr = lowByteSrc + (highByteSrc << 8);
                    });

                    // Read low byte from srcAddr
                    this.queueStep(() => {
                        lowByte = this.memory.readByte(srcAddr);
                    });

                    // Read high byte from srcAddr
                    this.queueStep(() => { // TODO: check for crossing page boundary
                        highByte = this.memory.readByte(srcAddr + 1);
                        operand.value = lowByte + (highByte << 8);
                    });

                    
                })();
            break;

            case 'INDY': // The zero page address is dereferenced, and the Y register is added to the resulting address
                (() => {
                    let zeroAddrSrc, srcLowByte, srcHighByte, srcAddr;
                    let lowByte, highByte;

                    // Get low byte
                    this.queueStep(() => {
                        zeroAddrSrc = this.popByte();
                        // console.log(`zeroAddrSrc: ${CPU.dec2hexByte(zeroAddrSrc)}`);
                    });

                    this.queueStep(() => {
                        srcLowByte = this.memory.readByte(zeroAddrSrc);
                        // console.log(`srcLowByte: ${CPU.dec2hexByte(srcLowByte)}`);
                    });

                    this.queueStep(() => {
                        srcHighByte = this.memory.readByte((zeroAddrSrc+1) & 0xFF);
                        // console.log(`srcHighByte: ${CPU.dec2hexByte(srcHighByte)}`);
                        
                        srcAddr = ((srcLowByte + (srcHighByte << 8)) + this.registers.y);
                        // console.log(`srcAddr: ${CPU.dec2hexWord(srcAddr)}`);

                        operand.value = srcAddr;
                    });
                    
                })();
                break;

                case 'ZPG': // One-byte Zero page address
                (() => {
                    let lowByte;

                    this.queueStep(() => {
                        lowByte = this.popByte();
                        // console.log(`Got lowByte: ${lowByte}`);
                        const addr = lowByte;
                        operand.value = addr;
                    });

                })();
                break;

                case 'ZPGX': // One-byte Zero page address indexed by X
                (() => {
                    let lowByte;

                    this.queueStep(() => {
                        lowByte = this.popByte();
                        // console.log(`Got lowByte: ${lowByte}`);
                    });

                    this.queueStep(() => {
                        const addr = (lowByte + this.registers.x) & 0xFF;
                        // console.log(`Got lowByte: ${lowByte}`);
                        operand.value = addr;
                    });

                    

                })();
                break;

            case 'XIND': // Take the zero page address, add the value of the X register to it, then use that to look up a two-byte address
                (() => {
                    let zeroAddrSrc, srcAddr;
                    let lowByte, highByte;

                    // Get low byte
                    this.queueStep(() => {
                        zeroAddrSrc = this.popByte();
                        // console.log(`zeroAddrSrc: ${CPU.dec2hexByte(zeroAddrSrc)}`);
                    });

                    this.queueStep(() => {
                        srcAddr = (zeroAddrSrc + this.registers.x) & 0xFF; // Handle overflow to keep in zero page
                        // console.log(`srcAddr: ${CPU.dec2hexByte(srcAddr)}`);
                    });

                    this.queueStep(() => {
                        lowByte = this.memory.readByte(srcAddr);
                        // console.log(`lowByte: ${CPU.dec2hexByte(lowByte)}`);
                    });

                    this.queueStep(() => {
                        highByte = this.memory.readByte(srcAddr + 1);
                        // console.log(`highByte: ${CPU.dec2hexByte(highByte)}`);
                        const finalAddress = lowByte + (highByte << 8);
                        operand.value = finalAddress;
                    });
                    
                })();
                break;

            default:
                console.log(`Unknown addressing mode '${mode}'`);
                break;
        }
    }


    /**
     * Add a step to the sub instruction queue
     * @param {function} fn 
     */
    queueStep(fn) {
        // console.log('queueStep: ', fn);
        this.subCycleInstructions.push(fn);
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