import { InstructionDecoder } from './InstructionDecoder.mjs';

export class Assembler {
    static acceptableSymbol = /^[A-Za-z_][A-Za-z0-9_]*$/;

    static branchOpcodes = ['BPL', 'BMI', 'BVC', 'BVS', 'BCC', 'BCS', 'BVS', 'BNE', 'BEQ'];

    static assemble(asm) {
        let lines = asm.split('\n');
        let outputLines = [];

        let currentAddress = 0x0600; // TODO
        let symbols = [];
        let labels = {};
        
        lines = lines.filter(generateSymbols);
        // console.log(lines);
        // console.log('symbols: ', symbols);
        lines.forEach(assembleLine);
        outputLines.forEach(replaceLabels);

        return outputLines.join('\n');



        // Inner functions 

        function generateSymbols(line) {
            // Drop anything including and after a semicolon
            line = /^([^;]*)/g.exec(line)[1].trim();

            line = Assembler.substituteCharacterLiterals(line);

            // This matches the parts of a symbol definition, eg BUFFER = $01F
            const symbolDefinitionRegex = /(\w+)\s*=\s*(\$?\w+)/g;
            
            let match = symbolDefinitionRegex.exec(line);
            if(match) {
                if(/^[A-Za-z_][A-Za-z0-9_]*$/.test(match[1])) {
                    // console.log('match: ', match);
                    if(symbols[match[1]] !== undefined) {
                        throw new Error(`Symbol ${match[1]} has already been defined!`);
                    } else {
                        console.log(`Added symbol ${match[1]} = ${match[2]}`);
                        symbols[match[1]] = match[2];
                    }
                } else {
                    console.log('illegal character(s) match', match)
                    throw new Error(`Symbol '${match[1]}' contains illegal character(s)`);
                }

                return false; // Remove from lines
            } else {
                return true; // Retain in lines
            }
        }

        function assembleLine(line, lineIndex) {
            const tokens = Assembler.tokenizeLine(line);

            let parseMode = undefined;
            let addressMode = undefined;

            tokens.forEach((tokenObj, tokenIndex) => {
                const token = tokenObj.token;

                if(parseMode === 'ignore') {
                    return;
                }

                if(token.charAt(0) === ';') {
                    // Everything including and after this is a comment
                    parseMode = 'ignore';
                    return;
                }

                if(token.charAt(token.length - 1) === ':') { // Token is a label
                    let trimmedToken = token.slice(0, -1); // Remove the colon
                    
                    console.log(`Processing label '${trimmedToken}' at address 0x${currentAddress.toString(16).padStart(4, '0').toUpperCase()}`);

                    if(labels[trimmedToken] !== undefined) {
                        throw new Error(`Label ${trimmedToken} has already been defined!`);
                    } else {
                        labels[trimmedToken] = currentAddress.toString(16).padStart(4, '0').toUpperCase();
                    }
                    return;
                }

                if(parseMode === 'operand') {
                    // console.log(`${tokens[tokenIndex-1].token} ${decodedOperand.operand} ${decodedOperand.mode}`);
                    try {
                        const instruction = tokens[tokenIndex-1].token;
                        // Last was instruction, must be operand
                        const decodedOperand = Assembler.decodeAddressMode(instruction, token, symbols, labels, currentAddress);

                        const opcode = InstructionDecoder.getOpcode(instruction, decodedOperand.mode);
                        console.log(`${instruction} ${decodedOperand.mode} : ${opcode}`);
                        outputLines.push(`<b>${opcode.toString(16).padStart(2, '0').toUpperCase()}</b> ${decodedOperand.operand}<br>`);

                        currentAddress += decodedOperand.bytes;
                    } catch(e) {
                        throw new Error(`${e}: ${lineIndex+1}: ${line}`);
                    }

                    parseMode = undefined;
                    return;
                }

                if(parseMode === 'directive') {
                    const instruction = tokens[tokenIndex-1].token;
                    let operand = token;
                    if(instruction.toUpperCase() === '.WORD') {
                        console.log(`.WORD ${operand}`);
                        if(!operand.match(/^\$[0-9A-Fa-f]{4}$/)) {
                            if(symbols[operand] !== undefined) { // Symbol found in symbols
                                operand = `${symbols[operand]}`;
                            } else {
                                // Assume it is a label
                                outputLines.push(`__LABEL_ABS_${currentAddress.toString(16).padStart(4, '0').toUpperCase()}__` + operand + '<br>');
                                parseMode = undefined;
                                return;
                            }
                        }
                        if(operand.match(/^\$[0-9A-Fa-f]{4}$/)) {
                            outputLines.push(Assembler.formatOperand(operand) + '<br>');
                            parseMode = undefined;
                            return;
                        }
                    } else if(instruction.toUpperCase() === '.BYTE') {
                        console.log(`.BYTE ${operand}`);
                        if(!operand.match(/^\$[0-9A-Fa-f]{2}$/)) {
                            if(symbols[operand] !== undefined) { // Symbol found in symbols
                                operand = `${symbols[operand]}`;
                            } else {
                                throw new Error(`Symbol or label '${operand}' has not been defined!`);
                            }
                        }
                        if(operand.match(/^\$[0-9A-Fa-f]{2}$/)) {
                            outputLines.push(Assembler.formatOperand(operand) + '<br>');
                            parseMode = undefined;
                            return;
                        }
                    } else if(instruction.toUpperCase() === '.ORG') {
                        // TODO Pfttt. Dunno yet
                        parseMode = undefined;
                        return;
                    }

                }

                if(['.WORD', '.BYTE', '.ORG'].includes(token.toUpperCase())) {
                    // Assmebler directive
                    parseMode = 'directive';

                    return;
                }

                if(InstructionDecoder.isInstruction(token)) {
                    // console.log(`${tokens[0]} is an instruction`);
                    if(tokenIndex === tokens.length - 1) {
                        // This is the last token
                        console.log(`${token} (IMPL)`);
                        try {
                            const opcode = InstructionDecoder.getOpcode(tokens[tokenIndex].token, 'IMPL');                            
                            outputLines.push(`<b>${opcode.toString(16).padStart(2, '0').toUpperCase()}</b><br>`);
                        } catch(e) {
                            throw new Error(`${e}: ${lineIndex+1}: ${line}`);
                        }
                        currentAddress += 1;
                    } else {
                        parseMode = 'operand';
                    }
                    return;
                }

                // Something wrong if we've ended up here!
                throw new Error(`SYNTAX ERROR on line ${lineIndex+1}: ${line}`);
            });

        }


        /**
         * Replace lables with the appropriate address
         * 
         * @param {String} line 
         * @returns String
         */
        function replaceLabels(line, index) {
            const regex = /__LABEL_(REL|ABS)_([A-F0-9]+)__(\w+)/;
            let match;

            if((match = regex.exec(line)) !== null) {
                console.log('match label postprocess: ', match);
                const type = match[1];
                const sourceAddress = match[2];
                const labelName = match[3];
                const labelAddress = labels[labelName];

                if(labelAddress === undefined) {
                    console.log('lables: ', labels);
                    throw new Error(`Label '${labelName}' has not been defined!`);
                }

                console.log(`Replacing '__LABEL_${type}__${labelName}' with ${labelAddress}`);
                switch(type) {
                    case 'REL':
                        const relativeAddress = Assembler.getRelativeAddress(sourceAddress, labelAddress);
                        line = line.replace(`__LABEL_${type}_${sourceAddress}__${labelName}`, relativeAddress);
                        break;
                    
                    case 'ABS':
                        const address = Assembler.bigToLitteEndian(labelAddress);
                        line = line.replace(`__LABEL_${type}_${sourceAddress}__${labelName}`, address);

                }
                outputLines[index] = line.replace(`__LABEL__${labelName}`, `<i>${labelAddress}</i>`);
            }

            return line;
        }


    }

    /**
     * Split a line of asm into tokens
     * 
     * @param {string} line 
     * @returns {Array<string>} tokens
     */
    static tokenizeLine(line) {
        const regex = /(\S+)(?=\s|$)/g; // Split on whitespace with case-insensitive matching
        let tokens = [];
        let match;

        while((match = regex.exec(line)) !== null) {
            // console.log('match: ' ,match);
            if(line[match.index] === ';') {
                break;
            }
            tokens.push({
                token: match[0],
                column: match.index,
            });
        }

        return tokens;
    }


    static decodeAddressMode(instruction, operand, symbols, labels, currentAddress) {
        let regex, match, operandValue;

        // Deal with character literal
        operand = Assembler.substituteCharacterLiterals(operand);

        /*

        IMPL - Implied, that has already been dealt with in the assembleLine FSM
        # - Immediate #$LL
        ABS - Absolute $LLHH 
        ABSX - Absolute, X $LLHH,X
        ABSY - Absolute, Y $LLHH,Y
        IND - Indirect ($LLHH) - JMP only
        XIND - Indexed Indirect ($LL,X)
        INDY - Indirect Indexed ($LL),Y
        REL - Relative $LL - only for branch instructions
        ZPG - Zero Page $LL
        ZPGX - Zero Page, X $LL,X
        ZPGY - Zero Page, Y $LL,Y - only for LDX and STX

        */

        // REL, ZPG, ABS

        if(Assembler.branchOpcodes.includes(instruction)) {
            // Is it a label?
            if(match = /(?:([a-z]+|[A-Z]+|[0-9]+|_))+$/g.exec(operand)) {
                console.log(`Operand '${operand}' appears to be a label`);
                // We will have to deal with this later!
                return {
                    mode: 'REL',
                    operand: `__LABEL_REL_${currentAddress.toString(16).padStart(4, '0').toUpperCase()}__` + operand,
                    bytes: 2
                }                
            } 
        } else if(instruction === 'JMP' || instruction === 'JSR') {
            console.log(`JMP/JSR`);
            if(match = /(?:([a-z]+|[A-Z]+|[0-9]+|_))+$/g.exec(operand)) { // ABS
                console.log(`Operand '${operand}' appears to be a label (JMP/JSR)`);
                return {
                    mode: 'ABS',
                    operand: `__LABEL_ABS_${currentAddress.toString(16).padStart(4, '0').toUpperCase()}__` + operand,
                    bytes: 3
                }                
            } else if(match = /^\$([0-9A-Fa-f]{3,4})$/g.exec(operand)) {
                return {
                    mode: 'ABS',
                    operand: Assembler.formatOperand(match[1].substring(1)),
                    bytes: 3
                }
            } else if(match = /\((?:([a-z]+|[A-Z]+|[0-9]+|_))+\)$/g.exec(operand)) { // IND symbol
                // console.log(`Operand '${operand}' appears to be a IND symbol`);

                if(symbols[match[1]] !== undefined) { // Symbol found in symbols
                    operandValue = `${symbols[match[1]]}`;
                } else {
                    throw new Error(`Symbol '${match[1]}' has not been defined!`);
                }

                return {
                    mode: 'IND',
                    operand: Assembler.formatOperand(operandValue),
                    bytes: 3
                }                
            } else if(match = /^\(\$([0-9A-Fa-f]{3,4})\)$/g.exec(operand)) { // IND literal
                return {
                    mode: 'IND',
                    operand: Assembler.formatOperand(match[1].substring(1)),
                    bytes: 3
                }
            }
            
            throw new Error(`JMP mode not implemented yet`);

        }         
        // # - Immediate
        regex = /^#(.+)$/g;
        if(match = regex.exec(operand)) {
            // console.log(`Operand '${operand}' appears to be immediate`);

            operandValue = match[1];

            regex = /^\$[0-9A-Fa-f]{1,2}$/; // One or two digit $-prefixed hex number 
            if(!operandValue.match(regex)) {
                // console.log(`Operand '${operand}' appears to be a symbol`);
                if(operandValue.match(Assembler.acceptableSymbol)) {
                    if(symbols[operandValue] !== undefined) { // Symbol found in symbols
                        operandValue = `${symbols[operandValue]}`;
                    } else {
                        throw new Error(`Symbol '${operandValue}' has not been defined!`);
                    }
                }
            }

            if(operandValue.match(regex)) { // Literal byte
                return {
                    mode: '#',
                    operand: Assembler.formatOperand(operandValue),
                    bytes: 2
                }                
            }
        }

        // Absolute,X; Absolute,Y; ZPGX; ZPGY
        regex = /^(\$?\w+),([X|Y])$/;
        if(match = regex.exec(operand)) {
            // console.log(`Operand '${operand}' appears to be Absolute,[X|Y]`);

            operandValue = match[1];

            regex = /^\$[0-9A-Fa-f]{1,4}$/; // One to four digit $-prefixed hex number 
            if(!operandValue.match(regex)) {
                // console.log(`Operand '${operand}' appears to be a symbol`);
                if(operandValue.match(Assembler.acceptableSymbol)) {
                    if(symbols[operandValue] !== undefined) { // Symbol found in symbols
                        operandValue = `${symbols[operandValue]}`;
                    } else {
                        throw new Error(`Symbol '${operandValue}' has not been defined!`);
                    }
                }
            }

            if(operandValue.match(regex)) { // Literal byte                            
                return {
                    mode: (operandValue.length === 3 ? 'ZPG' : 'ABS') + match[2],
                    operand: Assembler.formatOperand(operandValue),
                    bytes: 3
                }                
            }
        }

        // XIND
        regex = /^\((\$?\w+),X\)$/;
        if(match = regex.exec(operand)) {
            // console.log(`Operand '${operand}' appears to be XIND`);

            operandValue = match[1];

            regex = /^\$[0-9A-Fa-f]{1,2}$/; // One or two digit $-prefixed hex number 
            if(!operandValue.match(regex)) {
                // console.log(`Operand '${operandValue}' appears to be a symbol (XIND)`);
                if(operandValue.match(Assembler.acceptableSymbol)) {
                    if(symbols[operandValue] !== undefined) { // Symbol found in symbols
                        operandValue = `${symbols[operandValue]}`;
                    } else {
                        throw new Error(`Symbol '${operandValue}' has not been defined!`);
                    }
                }
            }

            if(operandValue.match(regex)) { // Literal byte                            
                return {
                    mode: 'XIND',
                    operand: Assembler.formatOperand(operandValue),
                    bytes: 2
                }                
            }
        }

        // INDY
        regex = /^\((\$?\w+)\),Y$/;
        if(match = regex.exec(operand)) {
            // console.log(`Operand '${operand}' appears to be INDY`);

            operandValue = match[1];

            regex = /^\$[0-9A-Fa-f]{1,2}$/; // One or two digit $-prefixed hex number 
            if(!operandValue.match(regex)) {
                // console.log(`Operand '${operandValue}' appears to be a symbol (XIND)`);
                if(operandValue.match(Assembler.acceptableSymbol)) {
                    if(symbols[operandValue] !== undefined) { // Symbol found in symbols
                        operandValue = `${symbols[operandValue]}`;
                    } else {
                        throw new Error(`Symbol '${operandValue}' has not been defined!`);
                    }
                }
            }

            if(operandValue.match(regex)) { // Literal byte                            
                return {
                    mode: 'INDY',
                    operand: Assembler.formatOperand(operandValue),
                    bytes: 2
                }                
            }
        }


        // Absolute symbol
        if(match = /^([a-zA-Z0-9]+)$/g.exec(operand)) {
            // console.log(`Operand '${operand}' appears to be a symbol`);
            if(symbols[match[1]] !== undefined) { // Symbol found in symbols
                operand = `${symbols[match[1]]}`;
                // console.log(`Operand is now ${operand}`);
            } else {
                throw new Error(`Symbol '${match[1]}' has not been defined!`);
            }
        }

        if(match = /^\$[0-9A-Fa-f]{3,4}$/g.exec(operand)) {
            // console.log('match ABS: ', match);
            return {
                mode: 'ABS',
                operand: Assembler.formatOperand(operand),
                bytes: 3
            }
        }
    
        if(match = /^\$[0-9A-Fa-f]{1,2}$/g.exec(operand)) {
            // console.log('match ZPG: ', match);
            return {
                mode: 'ZPG',
                operand: Assembler.formatOperand(operand),
                bytes: 3
            }
        }

    

        return {
            mode: '??',
            bytes: 1
        };
    }

    /**
     * Substitutes character literals with their ASCII values, accounting 
     * for whether they are decimal or hex. 
     *  
     * eg: 
     * $'A' -> $41 
     * 'A' -> 65
     *
     * @param {String} line 
     * @returns {String} line with character literals substituted
     */
    static substituteCharacterLiterals(line) {
        const newLine = line.replace(/'(.)'/g, function(match, p1) {
            return '$' + p1.charCodeAt(0).toString(16);
        });

        if(newLine !== line) {
            console.log(`Substituted character literals in '${line}' to '${newLine}'`);
        }
        
        return newLine;
    }



    /**
     * Format an operand to be used in the output
     * If the operand is a word, return it in little-endian format
     * 
     * @param {String} operand 
     * @returns {String} formatted operand
     */
    static formatOperand(operand) {
        if(operand[0] == '$') {
            // Operand is hex. Convert to little-endian
            return Assembler.bigToLitteEndian(operand.substring(1));
        } else {
            // Operand is decimal
        }
    }    

    static bigToLitteEndian(hex) {
        if(hex.length === 2) {
            return hex;
        }
        if(hex.length === 3 || hex.length === 4) {
            // If the hex number is three digits, prepend a zero
            if(hex.length === 3) {
                hex = '0' + hex;
            }
            // Swap the bytes
            return hex.substring(2, 4) + ' ' + hex.substring(0, 2);
        } else {
            throw new Error('Input must be a two, three or four digit hex number');
        }
    }

    static getRelativeAddress(sourceAddress, targetAddress) {
        // console.log('sourceAddress: ', sourceAddress);
        // console.log('targetAddress: ', targetAddress);
        // Convert the addresses from hex to decimal
        let source = parseInt(sourceAddress, 16);
        let target = parseInt(targetAddress, 16);

        // Calculate the offset
        let offset = target - source - 2; // Subtract 2 because the program counter will have moved on by 2 bytes by the time the offset is added

        // console.log('offset: ', offset);

        // Convert the offset to two's complement form
        if (offset < 0) {
            offset = 0x100 + offset; // For negative offsets, add 256 (0x100) to get the two's complement representation
        }

        // console.log('offset: ', offset);

        // Convert the offset back to hex
        let hexOffset = offset.toString(16).toUpperCase();

        // Pad the hex offset with zeros to ensure it's two digits long
        while (hexOffset.length < 2) {
            hexOffset = '0' + hexOffset;
        }

        // console.log('hexOffset: ', hexOffset);

        return hexOffset;
    }
        
}