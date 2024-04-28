import { Assembler } from "./Assembler.mjs";

export class InstructionDecoder {
    static opcodes = [
        //          0                1                2             3             4                 5                 6                 7             8                9                A                B             C                D                E                F
        /* 0 */  [ ['BRK', 'IMPL'], ['ORA', '#'   ], [null, null], [null, null], [null , null   ], ['ORA', 'ZPG'  ], ['ASL', 'ZPG'  ], [null, null], ['PHP', 'IMPL'], ['ORA', '#'   ], ['ASL', 'IMPL'], [null, null], [null, null   ], ['ORA', 'ABS' ], ['ASL', 'ABS' ], [null, null] ],
        /* 1 */  [ ['BPL', 'REL' ], ['ORA', 'INDY'], [null, null], [null, null], [null , null   ], ['ORA', 'ZPGX' ], ['ASL', 'ZPGX' ], [null, null], ['CLC', 'IMPL'], ['ORA', 'ABSY'], [null, null   ], [null, null], [null, null   ], ['ORA', 'ABSX'], ['ASL', 'ABSX'], [null, null] ],
        /* 2 */  [ ['JSR', 'ABS' ], ['AND', 'XIND'], [null, null], [null, null], ['BIT', 'ZPG'  ], ['AND', 'ZPG'  ], ['ROL', 'ZPG'  ], [null, null], ['PLP', 'IMPL'], ['AND', '#'   ], ['ROL', 'IMPL'], [null, null], ['BIT', 'ABS' ], ['AND', 'ABS' ], ['ROL', 'ABS' ], [null, null] ],
        /* 3 */	 [ ['BMI', 'REL' ], ['AND', 'INDY'], [null, null], [null, null], [null, null    ], ['AND', 'ZPGX' ], ['ROL', 'ZPGX' ], [null, null], ['SEC', 'IMPL'], ['AND', 'ABSY'], [null, null   ], [null, null], [null, null   ], ['AND', 'ABSX'], ['ROL', 'ABSX'], [null, null] ],
        /* 4 */	 [ ['RTI', 'IMPL'], ['EOR', 'XIND'], [null, null], [null, null], [null, null    ], ['EOR', 'ZPG'  ], ['LSR', 'ZPG'  ], [null, null], ['PHA', 'IMPL'], ['EOR', '#'   ], ['LSR', 'IMPL'], [null, null], ['JMP', 'ABS' ], ['EOR', 'ABS' ], ['LSR', 'ABS' ], [null, null] ],
        /* 5 */	 [ ['BVC', 'REL' ], ['EOR', 'INDY'], [null, null], [null, null], [null, null    ], ['EOR', 'ZPGX' ], ['LSR', 'ZPGX' ], [null, null], ['CLI', 'IMPL'], ['EOR', 'ABSY'], [null, null   ], [null, null], [null, null   ], ['EOR', 'ABSX'], ['LSR', 'ABSX'], [null, null] ],
        /* 6 */	 [ ['RTS', 'IMPL'], ['ADC', 'XIND'], [null, null], [null, null], [null, null    ], ['ADC', 'ZPG'  ], ['ROR', 'ZPG'  ], [null, null], ['PLA', 'IMPL'], ['ADC', '#'   ], ['ROR', 'IMPL'], [null, null], ['JMP', 'IND' ], ['ADC', 'ABS' ], ['ROR', 'ABS' ], [null, null] ],
        /* 7 */	 [ ['BVS', 'REL' ], ['ADC', 'INDY'], [null, null], [null, null], [null, null    ], ['ADC', 'ZPGX' ], ['ROR', 'ZPGX' ], [null, null], ['SEI', 'IMPL'], ['ADC', 'ABSY'], [null, null   ], [null, null], [null, null   ], ['ADC', 'ABSX'], ['ROR', 'ABSX'], [null, null] ],
        /* 8 */	 [ [null, null   ], ['STA', 'XIND'], [null, null], [null, null], ['STY', 'ZPG'  ], ['STA', 'ZPG'  ], ['STX', 'ZPG'  ], [null, null], ['DEY', 'IMPL'], [null, null   ], ['TXA', 'IMPL'], [null, null], ['STY', 'ABS' ], ['STA', 'ABS' ], ['STX', 'ABS' ], [null, null] ],
        /* 9 */	 [ ['BCC', 'REL' ], ['STA', 'INDY'], [null, null], [null, null], ['STY', 'ZPGX' ], ['STA', 'ZPGX' ], ['STX', 'ZPGY' ], [null, null], ['TYA', 'IMPL'], ['STA', 'ABSY'], ['TXS', 'IMPL'], [null, null], [null, null   ], ['STA', 'ABSX'], [null, null   ], [null, null] ],
        /* A */	 [ ['LDY', '#'   ], ['LDA', 'XIND'], ['LDX', '#'], [null, null], ['LDY', 'ZPG'  ], ['LDA', 'ZPG'  ], ['LDX', 'ZPG'  ], [null, null], ['TAY', 'IMPL'], ['LDA', '#'   ], ['TAX', 'IMPL'], [null, null], ['LDY', 'ABS' ], ['LDA', 'ABS' ], ['LDX', 'ABS' ], [null, null] ],
        /* B */	 [ ['BCS', 'REL' ], ['LDA', 'INDY'], [null, null], [null, null], ['LDY', 'ZPGX' ], ['LDA', 'ZPGX' ], ['LDX', 'ZPGY' ], [null, null], ['CLV', 'IMPL'], ['LDA', 'ABSY'], ['TSX', 'IMPL'], [null, null], ['LDY', 'ABSX'], ['LDA', 'ABSX'], ['LDX', 'ABSY'], [null, null] ],
        /* C */	 [ ['CPY', '#'   ], ['CMP', 'XIND'], [null, null], [null, null], ['CPY', 'ZPG'  ], ['CMP', 'ZPG'  ], ['DEC', 'ZPG'  ], [null, null], ['INY', 'IMPL'], ['CMP', '#'   ], ['DEX', 'IMPL'], [null, null], ['CPY', 'ABS' ], ['CMP', 'ABS' ], ['DEC', 'ABS' ], [null, null] ],
        /* D */	 [ ['BNE', 'REL' ], ['CMP', 'INDY'], [null, null], [null, null], [null, null    ], ['CMP', 'ZPGX' ], ['DEC', 'ZPGX' ], [null, null], ['CLD', 'IMPL'], ['CMP', 'ABSY'], [null, null   ], [null, null], [null, null   ], ['CMP', 'ABSX'], ['DEC', 'ABSX'], [null, null] ],
        /* E */	 [ ['CPX', '#'   ], ['SBC', 'XIND'], [null, null], [null, null], ['CPX', 'ZPG'  ], ['SBC', 'ZPG'  ], ['INC', 'ZPG'  ], [null, null], ['INX', 'IMPL'], ['SBC', '#'   ], ['NOP', 'IMPL'], [null, null], ['CPX', 'ABS' ], ['SBC', 'ABS' ], ['INC', 'ABS' ], [null, null] ],
        /* F */	 [ ['BEQ', 'REL' ], ['SBC', 'INDY'], [null, null], [null, null], [null, null    ], ['SBC', 'ZPGX' ], ['INC', 'ZPGX' ], [null, null], ['SED', 'IMPL'], ['SBC', 'ABSY'], [null, null   ], [null, null], [null, null   ], ['SBC', 'ABSX'], ['INC', 'ABSX'], [null, null] ],
     ];


    /**
     * Takes an opcode and returns the instruction mnenomic and the addressing mode
     * 
     * eg 0xA2 returns [LDX, immediate]
     * 
     * @param {byte} opcode 
     * @returns [{String} instruction, {int} mode]
     */
    static decodeOpcode(opcode) {
        const lowByte =  opcode & 0xF;
        const highByte = (opcode >> 4) & 0xF;

        return InstructionDecoder.opcodes[highByte][lowByte];
    }

    /**
     * Is the token a 6502 instruction? 
     * @param {String} token 
     * @returns {boolean}
     */
    static isInstruction(token) {
        const instructionArray = InstructionDecoder.getInstructionArray();
        const isInstruction = instructionArray[token] != undefined;

        return isInstruction;
    }

    /**
     * Get the array of 6502 instructions
     * @returns {Array<string>} instructions
     */
    static getInstructionArray() {
        if(!InstructionDecoder.instructionArray) {
            InstructionDecoder.buildInstructionArray();
        }

        return InstructionDecoder.instructionArray;
    }

    /**
     * Build the array of intructions from the opcodes static property
     */
    static buildInstructionArray() {
        InstructionDecoder.instructionArray = [];

        InstructionDecoder.opcodes.forEach((row, rowIndex) => {
            row.forEach((opcode, colIndex) => {
                if(InstructionDecoder.instructionArray[opcode[0]] === undefined && opcode[0] !== null) {
                    InstructionDecoder.instructionArray[opcode[0]] = [];
                }
                if(opcode[1] !== null) {
                    InstructionDecoder.instructionArray[opcode[0]][opcode[1]] = (rowIndex * 16) + colIndex;
                }
            });
        });
    }

    /**
     * Look up instruction and mode and return the opcode
     * 
     * @param {String} instruction 
     * @param {String} mode 
     * @returns {Integer} opcode
     */
    static getOpcode(instruction, mode) {
        const instructionArray = InstructionDecoder.getInstructionArray();
        if(instructionArray[instruction] != undefined) {
            if(instructionArray[instruction][mode] != undefined) {
                return instructionArray[instruction][mode];
            }
        }

        throw new Error(`Opcode not found for instruction '${instruction}' mode '${mode}'`);
    }

}