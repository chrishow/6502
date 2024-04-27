import { InstructionDecoder } from './InstructionDecoder.mjs';

export class Assembler {
    static permittedSymbolCharactersTest() {
        return /^(?:[a-z]+|[A-Z]+|[0-9]+|_)+$/gm;
    }

    static branchOpcodes = ['BPL', 'BMI', 'BVC', 'BVS', 'BCC', 'BVS', 'BNE', 'BEQ'];

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
            // This matches the parts of a symbol definition, eg BUFFER = $01F
            const symbolDefinitionRegex = /^\s*([^;\r\n\s=]+)\s*=\s*(.*?)\s*(?=\s*(?:;|$))/gm;

            let match = symbolDefinitionRegex.exec(line);
            if(match) {                
                if(!Assembler.permittedSymbolCharactersTest().test(match[1])) {
                    console.log('illegal character(s) match', match)
                    throw new Error(`Symbol '${match[1]}' contains illegal character(s)`);
                }
                if(symbols[match[1]] !== undefined) {
                    throw new Error(`Symbol ${match[1]} has already been defined!`);
                } else {
                    console.log(`Added symbol ${match[1]} = ${match[2]}`);
                    symbols[match[1]] = match[2];
                }

                return false; // Remove from lines
            } else {
                // console.log('Line is not symbol definition: ', line);
                return true; // Retain in lines
            }
        }

        function assembleLine(line, lineIndex) {
            const tokens = Assembler.tokenizeLine(line);
            // console.log('tokens: ', tokens);

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

                if(token.charAt(token.length - 1) === ':') {
                    let trimmedToken = token.slice(0, -1);
                    // Token is a label
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
                        // Last was instruction, must be operand
                        const decodedOperand = Assembler.decodeAddressMode(tokens[tokenIndex-1].token, token, symbols, labels, currentAddress);

                        const opcode = InstructionDecoder.getOpcode(tokens[tokenIndex-1].token, decodedOperand.mode);
                        console.log(`${tokens[tokenIndex-1].token} ${decodedOperand.mode} : ${opcode}`);
                        outputLines.push(`<b>${opcode.toString(16).padStart(2, '0').toUpperCase()}</b> ${decodedOperand.operand}<br>`);

                        currentAddress += decodedOperand.bytes;
                    } catch(e) {
                        throw new Error(`${e}: ${line}`);
                    }

                    parseMode = undefined;
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
                            throw new Error(`${e}: ${line}`);
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
            const regex = /.+[A-F0-9]*.+__LABEL_(REL|ABS)_([A-F0-9]+)__(\w+)/;
            let match;

            if((match = regex.exec(line)) !== null) {
                // console.log('match: ', match);
                const type = match[1];
                const sourceAddress = match[2];
                const labelName = match[3];
                const labelAddress = labels[labelName];
                console.log(`Replacing '__LABEL_${type}__${labelName}' with ${labelAddress}`);
                switch(type) {
                    case 'REL':
                        const relativeAddress = Assembler.getRelativeAddress(sourceAddress, labelAddress);
                        line = line.replace(`__LABEL_${type}_${sourceAddress}__${labelName}`, relativeAddress);
                        break;
                    
                    case 'ABS':
                        const address = Assembler.bigToLitteEndian(sourceAddress);
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
        let regex, match;


        // Character literal
        if(match = /'(\S)'/g.exec(operand)) {
            // console.log(`Operand '${operand}' is a character literal`);
            // Replace the character with its ASCII code
            operand = `#\$${match[1].charCodeAt(0).toString(16).toUpperCase()}`;
        }



        // literal symbol
        if(match = /^#(?!$[0-9A-Fa-f]{1,4}$)(\w+)$/g.exec(operand)) {
        // console.log(`Operand '${operand}' appears to be a symbol`);
        console.log('match literal symbol: ', match);
        if(symbols[match[1]] !== undefined) { // Symbol found in symbols
            operand = `#${symbols[match[1]]}`;
        } else {
            throw new Error(`Symbol '${match[1]}' has not been defined!`);
        }
    }

        // console.log('operand: ', operand);

        // literal byte
        regex = /^#\$[0-9A-Fa-f]{1,2}$/;
        if(operand.match(regex)) {
            return {
                mode: '#',
                operand: Assembler.formatOperand(operand.substring(1)),
                bytes: 2
            }
        }

        // literal word
        regex = /^#\$[0-9A-Fa-f]{3,4}$/;
        if(operand.match(regex)) {
            return {
                mode: '#',
                operand: Assembler.formatOperand(operand.substring(1)),
                bytes: 3
            }
        }

        // ABS,Y symbol
        if(match = /^((?![$][0-9A-Fa-f]{4}$)\w+),Y/gm.exec(operand)) {
            if(symbols[match[1]] !== undefined) { // Symbol found in symbols
                operand = `${symbols[match[1]]},Y`;
            } else {
                throw new Error(`Symbol '${match[1]}' has not been defined!`);
            }
        }
        
        regex = /^(\$[0-9A-Fa-f]{3,4}),Y$/; // ABS,Y: XXXX,Y
        if(operand.match(regex)) {
            return {
                mode: 'ABSY',
                operand: Assembler.formatOperand(operand.slice(0,-2)),
                bytes: 3
            }
        }

        regex = /^\$[0-9A-Fa-f]{1,2},Y$/; // ZPG,Y XX,Y
        if(operand.match(regex)) {
            return {
                mode: 'ZPG,Y',
                operand: Assembler.formatOperand(operand.slice(0,-2)),
                bytes: 3
            }
        }

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
            if(match = /(?:([a-z]+|[A-Z]+|[0-9]+|_))+$/g.exec(operand)) {
                console.log(`Operand '${operand}' appears to be a label`);
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
            } else if(match = /\((?:([a-z]+|[A-Z]+|[0-9]+|_))+\)$/g.exec(operand)) { // IND label
                console.log(`Operand '${operand}' appears to be a IND label`);
                return {
                    mode: 'IND',
                    operand: `__LABEL_ABS_${currentAddress.toString(16).padStart(4, '0').toUpperCase()}__` + match[1],
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

        } else {
            // naked byte
            regex = /^\$[0-9A-Fa-f]{1,2}$/;
            if(operand.match(regex)) {
                return {
                    mode: 'ZPG',
                    operand: Assembler.formatOperand(operand),
                    bytes: 2
                }
            }

            // naked word
            regex = /^\$[0-9A-Fa-f]{3,4}$/;
            if(operand.match(regex)) {
                return {
                    mode: 'ABS',
                    operand: Assembler.formatOperand(operand.substring(1)),
                    bytes: 3
                }
            }
        }

        // Absolute symbol
        if(match = /^([a-zA-Z0-9]+)$/g.exec(operand)) {
            console.log(`Operand '${operand}' appears to be a symbol`);
            if(symbols[match[1]] !== undefined) { // Symbol found in symbols
                operand = `${symbols[match[1]]}`;
                console.log(`Operand is now ${operand}`);
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

        // XIND symbol
        if(match = /^\(((?![$][0-9A-Fa-f]{4}$)\w+),X\)/gm.exec(operand)) {
            console.log('XIND symbol match: ', match);
            if(symbols[match[1]] !== undefined) { // Symbol found in symbols
                operand = `(${symbols[match[1]]},X)`;
            } else {
                throw new Error(`Symbol '${match[1]}' has not been defined!`);
            }
        }

        // XIND literal
        if(match = /^\((\$[0-9A-Fa-f]{1,2}),X\)$/g.exec(operand)) {
            console.log('match (ZPG,X): ', match);
            return {
                mode: 'XIND',
                operand: Assembler.formatOperand(match[1]),
                bytes: 2
            }
        }
    

        return {
            mode: '??',
            bytes: 1
        };
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