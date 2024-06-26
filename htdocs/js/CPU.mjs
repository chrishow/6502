import { Memory } from './Memory.mjs';
import { CPUDisplay } from "./CPUDisplay.mjs";
import { CPUTerminal } from "./CPUTerminal.mjs";
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

        if(options && options.terminalContainer) {
            this.terminal = document.createElement('cpu-terminal');
            this.terminal.cpu = this;

            options.terminalContainer.append(this.terminal);
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

            // this.updateDisplay();

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
        // console.log(`instruction: ${instruction}, mode: ${mode}`);
        this.currentInstructionDisplay = `Instruction: ${instruction}, mode: ${mode}`;


        switch (instruction) {
            case 'ADC': // Add Memory to Accumulator with Carry
                (() => {
                    let operand = {}; // We use an object, so it is passed by reference
                    let value;

                    if(mode !== '#') {
                        this.getOperand(mode, operand);
                    }

                    this.queueStep(() => {
                        let sum;

                        if(mode === '#') {
                            this.getOperand(mode, operand);
                            value = operand.value;
                        } else {
                            value = this.memory.readByte(operand.value);
                        }

                        // console.log(`value: ${CPU.dec2hexByte(operand.value)}, mode: ${mode}`);

                        if ((this.registers.a ^ value) & 0x80) {
                            this.registers.sr.v = 0;
                        } else {
                            this.registers.sr.v = 1;
                        }

                        if (this.registers.sr.d) { // Decimal mode
                            sum = (this.registers.a & 0xf) + (value & 0xf) + this.registers.sr.c;
                            if (sum >= 10) {
                                sum = 0x10 | ((sum + 6) & 0xf);
                            }

                            sum += (this.registers.a & 0xf0) + (value & 0xf0);
                            if (sum >= 160) {
                                this.registers.sr.c = 1;
                                if (this.registers.sr.v && sum >= 0x180) { this.registers.sr.v = 0; }
                                sum += 0x60;
                            } else {
                                this.registers.sr.c = 0;
                                if (this.registers.sr.v && sum < 0x80) { this.registers.sr.v = 0; }
                            }
                        } else {
                            sum = this.registers.a + value + this.registers.sr.c;
                            if (sum >= 0x100) {
                                this.registers.sr.c = 1;
                                if (this.registers.sr.v && sum >= 0x180) { this.registers.sr.v = 0; }
                            } else {
                                this.registers.sr.c = 0;
                                if (this.registers.sr.v && sum < 0x80) { this.registers.sr.v = 0; }
                            }
                        }

                        this.registers.a = sum & 0xff;
                        // console.log(`ADC result: ${CPU.dec2hexByte(this.registers.a)}`);
                        this.updateFlags(this.registers.a);
                    });

                })();
                break;

            case 'AND': // AND operand with accumulator
                (() => {
                    let operand = {};
                    let value;
                    this.getOperand(mode, operand);

                    this.queueStep(() => {
                        if(mode === '#') {
                            value = operand.value;
                        } else {
                            value = this.memory.readByte(operand.value);
                        }
                        // console.log(`AND a = ${CPU.dec2hexByte(this.registers.a)}, value = ${CPU.dec2hexByte(value)}`);
                        this.registers.a = this.registers.a & value;
                        this.updateFlags(this.registers.a);
                    });
                })();
                break;

            case 'ASL': // Arithmetic shift left
                (() => {
                    let operand = {};
                    let value;
                    this.getOperand(mode, operand);

                    if(mode === 'A') { // Do it to accumulator
                        this.queueStep(() => {
                            this.registers.sr.c = this.registers.a >= 0x80 ? 1 : 0;
                            this.registers.a = (this.registers.a << 1) & 0xff;
                            this.updateFlags(this.registers.a);
                        });
                    } else {
                        this.queueStep(() => {
                            value = this.memory.readByte(operand.value);
                        });

                        this.queueStep(() => {
                            this.registers.sr.c = value >= 0x80 ? 1 : 0;
                            value = (value << 1) & 0xff;
                            this.memory.writeByte(operand.value, value);
                            this.updateFlags(value);
                        });
                    }
                })();
                break;

            case 'BCC': // Branch on carry clear
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.c === 1) { // Carry flag is set, don't branch
                        return;
                    } 

                    this.doBranch(operand.value);                    
                });
                break;

            case 'BCS': // Branch on carry set
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.c === 0) { // Carry flag is clear, don't branch
                        return;
                    } 

                    this.doBranch(operand.value);                    
                });
                break;

            case 'BEQ': // Branch on zero flag = 1
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.z === 0) { // Zero flag is not set, don't branch
                        // console.log(`BEQ,  z not 0 but ${CPU.dec2hexByte(this.registers.sr.z)}`);
                        return;
                    } 

                    this.doBranch(operand.value);                    
                });
                break;

            case 'BIT': // BIT test, takes three (zero page) or four (absolute) cycles
                (() => {
                    let operand = {};
                    let value;

                    this.getOperand(mode, operand);

                    this.queueStep(() => { // Step 2
                        value = this.memory.readByte(operand.value);
                        // console.log(`value 0x${CPU.dec2hexByte(value)} read from: 0x${CPU.dec2hexWord(operand.value)}, ${mode}`);

                        this.registers.sr.n = (value & 0x80) > 0 ? 1 : 0; // Bit 7 of operand 
                        this.registers.sr.v = (value & 0x40) > 0 ? 1 : 0 // Bit 6 of operand

                        if(value & this.registers.a !== 0) {
                            // Result is non-zero
                            this.registers.sr.z = 0;
                        } else {
                            this.registers.sr.z = 1;
                        }
                    });

                })();
                break;

            case 'BMI': // Branch on  Minus
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.n === 0) { // Not negative, don't branch
                        // console.log(`BMI,  z = 1 but ${CPU.dec2hexByte(this.registers.sr.z)}`);
                        return;
                    } 

                    this.doBranch(operand.value);
                });
                break;


            case 'BNE': // branch on zero flag = 0
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.z === 1) { // Zero flag is set, do not branch
                        // console.log(`BNE,  z = 1 but ${CPU.dec2hexByte(this.registers.sr.z)}`);
                        return;
                    } 

                    this.doBranch(operand.value);
                });
                break;

            case 'BPL': // Branch on positive
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.n === 1) { // Negative flag set, don't branch
                        // console.log(`BEQ,  z not 0 but ${CPU.dec2hexByte(this.registers.sr.z)}`);
                        return;
                    } 

                    this.doBranch(operand.value);                    
                });
                break;

            case 'BRK': // This isn't actually what the 6502 does, we will just stop the program for now
                this.stop();
                break;

                case 'BVC': // Branch on overflow clear
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.v === 1) { // Overflow flag set, don't branch
                        return;
                    } 

                    this.doBranch(operand.value);                    
                });
            break;

            case 'BVS': // Branch on overflow set
                this.queueStep(() => {
                    let operand = {};
                    this.getOperand(mode, operand);

                    if(this.registers.sr.v === 0) { // Overflow flag clear, don't branch
                        return;
                    } 

                    this.doBranch(operand.value);                    
                });
            break;

            case 'CLC': // Clear carry flag
                this.queueStep(() => {
                    this.registers.sr.c = 0;
                });
                break;

            case 'CLD': // Clear decimal mode
                this.queueStep(() => {
                    this.registers.sr.d = 0;
                });
                break;

            case 'CLI': // Clear Interrupt Disable Bit
                this.queueStep(() => {
                    this.registers.sr.i = 0;
                });
                break;

            case 'CLV': // Clear Overflow flag
                this.queueStep(() => {
                    this.registers.sr.v = 0;
                });
                break;

            case 'CMP': // Compare a, or a - operand
                this.compareRegister('a', mode);
                break;

            case 'CPX': // Compare x, or x - operand
                this.compareRegister('x', mode);
                break;

            case 'CPY': // Compare y, or y - operand
                this.compareRegister('y', mode);
                break;

            case 'DEC': // Decrement memory
                (() => {
                    let operand = {}, currentValue;
                    this.getOperand(mode, operand);

                    this.queueStep(() => {
                        currentValue = this.memory.readByte(operand.value);

                    });

                    this.queueStep(() => {
                        currentValue = (currentValue - 1);
                        if(currentValue === -1) {
                            currentValue = 0xFF;
                        }
                        this.memory.writeByte(operand.value, currentValue);
                        this.updateFlags(currentValue);
                    });

                })()
                break; 

            case 'DEX': // Decrement X
                this.queueStep(() => {
                    this.registers.x = (this.registers.x - 1) & 0xFF;
                    this.updateFlags(this.registers.x);
                });
                break;

            case 'DEY': // Decrement Y
                this.queueStep(() => {
                    this.registers.y = (this.registers.y - 1) & 0xFF;
                    this.updateFlags(this.registers.y);
                });
                break;

            case 'EOR': // Exclusive-OR Memory with Accumulator
                (() => {
                    let operand = {}, value;
                    this.getOperand(mode, operand);

                    this.queueStep(() => {
                        if(mode === '#') {
                            value = operand.value;
                        } else {
                            value = this.memory.readByte(operand.value);
                        }
    
                        this.registers.a = this.registers.a ^ value;
                        this.updateFlags(this.registers.a);
                    });
                })();
                break;

            case 'INC': // Increment memory
                (() => {
                    let operand = {}, currentValue;
                    this.getOperand(mode, operand);

                    this.queueStep(() => {
                        currentValue = this.memory.readByte(operand.value);

                    });

                    this.queueStep(() => {
                        currentValue = (currentValue + 1) & 0xFF;
                        this.memory.writeByte(operand.value, currentValue);
                        this.updateFlags(currentValue);
                    });

                })()
            break;
                
            case 'INX': // Increment X
                this.queueStep(() => {
                    this.registers.x = (this.registers.x + 1) & 0xFF;
                    this.updateFlags(this.registers.x);
                });
                break;

            case 'INY': // Increment Y
                this.queueStep(() => {
                    this.registers.y = (this.registers.y + 1) & 0xFF;
                    this.updateFlags(this.registers.y);
                });
                break;

            case 'JMP': // Jump to address
                (() => {
                    let operand = {}; // Memory address to store ac to 

                    this.getOperand(mode, operand);

                    this.queueStep(() => {
                        // Do the jump
                        // console.log(`JMP to ${CPU.dec2hexByte(operand.value)}`);
                        this.registers.pc = operand.value;
                    });

                })();
                break;

            case 'JSR': // Jump to subroutine. 
                (() => {
                    let returnAddress, highByte, lowByte;

                    this.queueStep(() => { // Clock cycle 2
                        lowByte = this.popByte();
                    });

                    this.queueStep(() => { // Clock cycle 3
                        highByte = this.popByte();
                    });

                    this.queueStep(() => { // Clock cycle 4
                        returnAddress = this.registers.pc - 1;
                        // console.log(`saving return address ${CPU.dec2hexWord(returnAddress)} on stack`)
                        this.pushToStack(returnAddress >> 8); // Save low byte of return address on stack
                    });

                    this.queueStep(() => { // Clock cycle 5
                        this.pushToStack(returnAddress & 0xFF); // Save high byte of return address on stack
                    });

                    this.queueStep(() => { // Clock cycle 6
                        this.registers.pc = lowByte + (highByte << 8);
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

            case 'NOP': // No Operation
                this.queueStep(() => {
                });
                break;
            
            case 'ORA': // OR Memory with Accumulator
                (() => {
                    let operand = {}, value;
                    this.getOperand(mode, operand);

                    this.queueStep(() => {
                        if(mode === '#') {
                            value = operand.value;
                        } else {
                            value = this.memory.readByte(operand.value);
                        }

                        this.registers.a = this.registers.a | value;
                        this.updateFlags(this.registers.a);
                    });
                })();
                break;

            case 'PHA': // Push a onto stack
                // This takes three cycles total, so need to use two here
                this.queueStep(() => {
                });
                this.queueStep(() => {
                    this.pushToStack(this.registers.a);
                });
                break;

            case 'PHP': // Push Processor Status on Stack
                // This takes three cycles total, so need to use two here
                this.queueStep(() => {
                });
                this.queueStep(() => {
                    let flagsByte = this.flagsToByte();
                    flagsByte = flagsByte | 16; // Break flag is always set for this instruction
                    this.pushToStack(flagsByte);
                });
                break;
                
            case 'PLA': // Pull from stack onto a
                // This takes three cycles total, so need to use two here
                this.queueStep(() => {
                });
                this.queueStep(() => {
                    this.registers.a = this.pullFromStack();
                });
                break;

            case 'PLP': // Pull Processor Status from Stack
                // This takes three cycles total, so need to use two here
                this.queueStep(() => {
                });
                this.queueStep(() => {
                    const currentBreak = this.registers.sr.b; // Need to 'ignore' break for this instruction
                    let flagsByte = this.pullFromStack();
                    this.byteToFlags(flagsByte);
                    this.registers.sr.b = currentBreak;
                });
                break;

            case 'ROL': // Rotate One Bit Left (Memory or Accumulator)
                (() => {
                    let operand = {};
                    let input;
                    this.getOperand(mode, operand);

                    if(mode === 'A') { // Do it to accumulator
                        this.queueStep(() => {
                            input = this.registers.a;

                            // Save carry
                            const saveCarry = this.registers.sr.c;
                            // Set carry from bit 7 of input
                            this.registers.sr.c = (input & (1<< 6)) ? 1 : 0;
                            // Rotate
                            input = (input << 1) & 0xff;
                            // Rotate in old carry at bit 0
                            input |= saveCarry; 
                            // Save back into a 
                            this.registers.a = input;
                            // Update flags
                            this.updateFlags(this.registers.a);
                        });
                    } else {
                        this.queueStep(() => {
                            input = this.memory.readByte(operand.value);
                        });

                        this.queueStep(() => {
                            // Save carry
                            const saveCarry = this.registers.sr.c;
                            // Set carry from bit 7 of input
                            this.registers.sr.c = (input & (1 << 7)) ? 1 : 0;
                            // Rotate
                            input = (input << 1) & 0xff;
                            // Rotate in old carry at bit 0
                            input |= saveCarry; 
                            // Save back into memory 
                            this.memory.writeByte(operand.value, input);
                            // Update flags
                            this.updateFlags(input);
                        });
                    }
                })();
            break;
                
            case 'ROR': // Rotate One Bit Right (Memory or Accumulator)
                (() => {
                    let operand = {};
                    let input;
                    this.getOperand(mode, operand);

                    if(mode === 'A') { // Do it to accumulator
                        this.queueStep(() => {
                            input = this.registers.a;

                            // Save carry
                            const saveCarry = this.registers.sr.c;
                            // Set carry from bit 1 of input
                            this.registers.sr.c = (input & (1 << 0)) ? 1 : 0;
                            // Rotate
                            input = input >> 1;
                            // Rotate in old carry at bit 8
                            if (saveCarry) { input |= 0x80; }
                            // Save back into a 
                            this.registers.a = input;
                            // Update flags
                            this.updateFlags(this.registers.a);
                        });
                    } else {
                        this.queueStep(() => {
                            input = this.memory.readByte(operand.value);
                        });

                        this.queueStep(() => {
                            // Save carry
                            const saveCarry = this.registers.sr.c;
                            // Set carry from bit 1 of input
                            this.registers.sr.c = (input & (1 << 0)) ? 1 : 0;
                            // Rotate
                            input = input >> 1;
                            // Rotate in old carry at bit 8
                            if (saveCarry) { input |= 0x80; }
                            // Save back into memory 
                            this.memory.writeByte(operand.value, input)
                            // Update flags
                            this.updateFlags(input);
                        });
                    }
                })();
                break;
                
            case 'RTI': // Return from Interrupt
                (() => {
                    let flagsByte, returnAddressLowByte, returnAddressHighByte;

                    this.queueStep(() => { // Clock cycle 2
                        flagsByte = this.pullFromStack();
                    });

                    this.queueStep(() => { // Clock cycle 3
                        returnAddressLowByte = this.pullFromStack();
                    });

                    this.queueStep(() => { // Clock cycle 4
                        returnAddressHighByte = this.pullFromStack();
                    });

                    this.queueStep(() => { // Clock cycle 5
                    });

                    this.queueStep(() => { // Clock cycle 6
                        const currentBreak = this.registers.sr.b; // Need to 'ignore' break for this instruction
                        this.byteToFlags(flagsByte);
                        this.registers.sr.b = currentBreak;
    
                        this.registers.pc = (returnAddressLowByte + (returnAddressHighByte << 8) + 1);
                    });
                })();
            break;

            case 'RTS': // Return from subroutine
                (() => {
                    let returnAddressLowByte, returnAddressHighByte;

                    this.queueStep(() => { // Clock cycle 2
                        returnAddressLowByte = this.pullFromStack();
                    });

                    this.queueStep(() => { // Clock cycle 3
                        returnAddressHighByte = this.pullFromStack();
                    });

                    this.queueStep(() => { // Clock cycle 4
                    });

                    this.queueStep(() => { // Clock cycle 5
                    });

                    this.queueStep(() => { // Clock cycle 6
                        this.registers.pc = (returnAddressLowByte + (returnAddressHighByte << 8) + 1);
                    });

                })();
                break;
            
            case 'SBC': // Subtract Memory from Accumulator with Borrow
                (() => {
                    let operand = {}; // We use an object, so it is passed by reference
                    let value;

                    if(mode !== '#') {
                        this.getOperand(mode, operand);
                    }

                    this.queueStep(() => {
                        let result, temp;

                        if(mode === '#') {
                            this.getOperand(mode, operand);
                            value = operand.value;
                        } else {
                            value = this.memory.readByte(operand.value);
                        }

                        // console.log(`value: ${CPU.dec2hexByte(operand.value)}, mode: ${mode}`);

                        if ((this.registers.a ^ value) & 0x80) {
                            this.registers.sr.v = 1;
                        } else {
                            this.registers.sr.v = 0;
                        }

                        if (this.registers.sr.d) { // Decimal mode
                            temp = 0xf + (this.registers.a & 0xf) - (value & 0xf) + this.registers.sr.c;
                            if (temp < 0x10) {
                                result = 0;
                                temp -= 6;
                            } else {
                                result = 0x10;
                                temp -= 0x10;
                            }
                            result += 0xf0 + (this.registers.a & 0xf0) - (value & 0xf0);
                            if (result < 0x100) {
                                this.registers.sr.c = 0;
                                if (this.registers.sr.v && result < 0x80) { this.registers.sr.v = 0; }
                                result -= 0x60;
                            } else {
                                this.registers.sr.c = 1;
                                if (this.registers.sr.v && result >= 0x180) { this.registers.sr.v = 0; }
                            }
                            result += temp;
                        } else {
                            result = 0xff + this.registers.a - value + this.registers.sr.c;
                            if (result < 0x100) {
                                this.registers.sr.c = 0;
                                if (this.registers.sr.v && result < 0x80) { this.registers.sr.v = 0; }
                            } else {
                                this.registers.sr.c = 1;
                                if (this.registers.sr.v && result >= 0x180) { this.registers.sr.v = 0; }
                            }
                        }

                        this.registers.a = result & 0xff;
                        // console.log(`ADC result: ${CPU.dec2hexByte(this.registers.a)}`);
                        this.updateFlags(this.registers.a);
                    });

                })();
                break;
                
            case 'SEC': // Set carry flag
                this.queueStep(() => { 
                    this.registers.sr.c = 1;
                });
                break;

            case 'SED': // Set decimal flag
                this.queueStep(() => { 
                    this.registers.sr.d = 1;
                });
                break;
            
            case 'SEI': // Set Interrupt Disable Status
                this.queueStep(() => { 
                    this.registers.sr.i = 1;
                });
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

            case 'TAY': // Transfer ac to y
                this.queueStep(() => {
                    this.registers.y = this.registers.a;

                    this.updateFlags(this.registers.y);
                });
                break;

            case 'TSX': // Transfer stack pointer to x
                this.queueStep(() => {
                    this.registers.x = this.registers.sp;

                    this.updateFlags(this.registers.x);
                });
                break;

            case 'TXA': // Transfer x to a
                this.queueStep(() => {
                    this.registers.a = this.registers.x;

                    this.updateFlags(this.registers.a);
                });
                break;

            case 'TXS': // Transfer x to stack pointer
                this.queueStep(() => {
                    this.registers.sp = this.registers.x;

                });
            break;

            case 'TYA': // Transfer y to a
                this.queueStep(() => {
                    this.registers.a = this.registers.y;

                    this.updateFlags(this.registers.a);
                });
                break;

            default:
                console.error(`Unknown instruction ${instruction}`);                
        }

    }

    /**
     * Perform a branch
     * 
     * @param {signed byte} offset 
     */
    doBranch(offset) {
        let newAddr;

        // Operand is 2s complement
        if (offset > 0x7f) { 
            // A negative offset
            newAddr = (this.registers.pc - (0x100 - offset));
        } else {
            // A positive offset
            newAddr = (this.registers.pc + offset);
        }

        // console.log(`Branch to ${CPU.dec2hexWord(newAddr)}`);
        this.registers.pc = newAddr;
    }

    /**
     * Convert status flags to a byte
     * @returns int byte;
     */
    flagsToByte() {
        let byte = 0;

        if(this.registers.sr.c === 1) {
            byte += 1;
        }

        if(this.registers.sr.z === 1) {
            byte += 2;
        }

        if(this.registers.sr.i === 1) {
            byte += 4;
        }

        if(this.registers.sr.d === 1) {
            byte += 8;
        }

        if(this.registers.sr.b === 1) {
            byte += 16;
        }

        if(1) {  // '-' flag, always set
            byte += 32;
        }

        if(this.registers.sr.v === 1) {
            byte += 64;
        }

        if(this.registers.sr.n === 1) {
            byte += 128;
        }


        return byte;
    }

    /**
     * Decodes byte to status flags and sets the flags
     * @param {*} byte 
     */
    byteToFlags(byte) {
        this.registers.sr.n = (byte & 128) ? 1 : 0;
        this.registers.sr.v = (byte & 64) ? 1 : 0;
        // - flag at position 32
        this.registers.sr.b = (byte & 16) ? 1 : 0;
        this.registers.sr.d = (byte & 8) ? 1 : 0;
        this.registers.sr.i = (byte & 4) ? 1 : 0;
        this.registers.sr.z = (byte & 2) ? 1 : 0;
        this.registers.sr.c = (byte & 1) ? 1 : 0;
    }

    /**
     * Push a value onto the stack, and adjust the stack pointer
     * @param {byte} value 
     */
    pushToStack(value) {
        // Store value to stack
        this.memory.writeByte(this.registers.sp + 0x100, value);

        // Decrement stack pointer
        this.registers.sp--;

        if (this.registers.sp < 0) { // Stack has overflowed!
            console.error('Stack has overflowed! Wrapping...')
            this.registers.sp = this.registers.sp & 0xff; // Wrap
        }
    }

    /**
     * Pop a value from the stack, and adjust the stack pointer
     * @param {byte}  
     * 
     * @return {Byte} value
     */
    pullFromStack() {
        let value;

        this.registers.sp++;

        if (this.registers.sp >= 0x100) {
            console.error('Stack has underflowed! Wrapping...')
            this.registers.sp = this.registers.sp & 0xFF;
        }

        value = this.memory.readByte(this.registers.sp + 0x100);
        return value;
    }

    /**
     * Compare a register to memory
     * 
     * @param {char} reg 
     * @param {String} mode 
     */
    compareRegister(reg, mode) {
        let operand = {}; // We use an object, so it is passed by reference

        if(mode !== '#') {
            this.getOperand(mode, operand);
        }

        this.queueStep(() => {
            if(mode === '#') {
                this.getOperand(mode, operand);
            }

            let result = this.registers[reg] - operand.value;
            
            if(result < 0) {
                this.registers.sr.c = 0;
            } else {
                this.registers.sr.c = 1;
            }

            this.updateFlags(result);
        });
    }


    /**
     * Load a register
     * 
     * @param {char} reg 
     * @paran {String} mode
     */
    loadRegister(reg, mode) {
        let operand = {};
        

        if(mode === '#') { // Must do all this in one cycle
            this.queueStep(() => {
                this.getOperand(mode, operand);
                // console.log(`LD${reg.toUpperCase()} immediate  ${CPU.dec2hexByte(operand.value)}, PC ${CPU.dec2hexWord(this.registers.pc)}`);
                this.registers[reg] = operand.value;
                this.updateFlags(this.registers[reg]);
            });

        } else {
            this.getOperand(mode, operand);

            this.queueStep(() => {
                // console.log(`LD${reg.toUpperCase()} ${mode} from 0x${CPU.dec2hexByte(operand.value)}`);
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
            // console.log(`ST${reg.toUpperCase()} ${CPU.dec2hexByte(this.registers[reg])} to ${CPU.dec2hexWord(operand.value)}`);
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

            case 'A': // Accumulator mode, used for some bit operations
                operand.value = null;
                break;

            case 'REL': // Relative
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

            case 'ABSX': // Absolute two byte address + x
                (() => {
                    let lowByte, highByte;

                    this.queueStep(() => {
                        lowByte = this.popByte();
                        // console.log(`Got lowByte: ${lowByte}`);
                    });

                    this.queueStep(() => {
                        highByte = this.popByte();
                        const addr = lowByte + (highByte << 8) + this.registers.x;

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
                        console.log(`XIND finalAddress: ${CPU.dec2hexWord(finalAddress)}`);
                        operand.value = finalAddress;
                    });
                    
                })();
                break;

            default:
                console.error(`Unknown addressing mode '${mode}'`);
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