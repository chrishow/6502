(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // htdocs/js/InstructionDecoder.mjs
  var _InstructionDecoder = class _InstructionDecoder {
    /**
     * Takes an opcode and returns the instruction mnenomic and the addressing mode
     * 
     * eg 0xA2 returns [LDX, immediate]
     * 
     * @param {byte} opcode 
     * @returns [{String} instruction, {int} mode]
     */
    static decodeOpcode(opcode) {
      const lowByte = opcode & 15;
      const highByte = opcode >> 4 & 15;
      return _InstructionDecoder.opcodes[highByte][lowByte];
    }
    /**
     * Is the token a 6502 instruction? 
     * @param {String} token 
     * @returns {boolean}
     */
    static isInstruction(token) {
      const instructionArray = _InstructionDecoder.getInstructionArray();
      return instructionArray[token] != void 0;
    }
    /**
     * Get the array of 6502 instructions
     * @returns {Array<string>} instructions
     */
    static getInstructionArray() {
      if (!_InstructionDecoder.instructionArray) {
        _InstructionDecoder.buildInstructionArray();
      }
      return _InstructionDecoder.instructionArray;
    }
    /**
     * Build the array of intructions from the opcodes static property
     */
    static buildInstructionArray() {
      _InstructionDecoder.instructionArray = [];
      _InstructionDecoder.opcodes.forEach((row, rowIndex) => {
        row.forEach((opcode, colIndex) => {
          if (_InstructionDecoder.instructionArray[opcode[0]] === void 0 && opcode[0] !== null) {
            _InstructionDecoder.instructionArray[opcode[0]] = [];
          }
          if (opcode[1] !== null) {
            _InstructionDecoder.instructionArray[opcode[0]][opcode[1]] = rowIndex * 16 + colIndex;
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
      const instructionArray = _InstructionDecoder.getInstructionArray();
      if (instructionArray[instruction] != void 0) {
        if (instructionArray[instruction][mode] != void 0) {
          return instructionArray[instruction][mode];
        }
      }
      throw new Error(`Opcode not found for instruction '${instruction}' mode '${mode}'`);
    }
  };
  __publicField(_InstructionDecoder, "opcodes", [
    //          0                1                2             3             4                 5                 6                 7             8                9                A                B             C                D                E                F
    /* 0 */
    [["BRK", "IMPL"], ["ORA", "#"], [null, null], [null, null], [null, null], ["ORA", "ZPG"], ["ASL", "ZPG"], [null, null], ["PHP", "IMPL"], ["ORA", "#"], ["ASL", "A"], [null, null], [null, null], ["ORA", "ABS"], ["ASL", "ABS"], [null, null]],
    /* 1 */
    [["BPL", "REL"], ["ORA", "INDY"], [null, null], [null, null], [null, null], ["ORA", "ZPGX"], ["ASL", "ZPGX"], [null, null], ["CLC", "IMPL"], ["ORA", "ABSY"], [null, null], [null, null], [null, null], ["ORA", "ABSX"], ["ASL", "ABSX"], [null, null]],
    /* 2 */
    [["JSR", "ABS"], ["AND", "XIND"], [null, null], [null, null], ["BIT", "ZPG"], ["AND", "ZPG"], ["ROL", "ZPG"], [null, null], ["PLP", "IMPL"], ["AND", "#"], ["ROL", "A"], [null, null], ["BIT", "ABS"], ["AND", "ABS"], ["ROL", "ABS"], [null, null]],
    /* 3 */
    [["BMI", "REL"], ["AND", "INDY"], [null, null], [null, null], [null, null], ["AND", "ZPGX"], ["ROL", "ZPGX"], [null, null], ["SEC", "IMPL"], ["AND", "ABSY"], [null, null], [null, null], [null, null], ["AND", "ABSX"], ["ROL", "ABSX"], [null, null]],
    /* 4 */
    [["RTI", "IMPL"], ["EOR", "XIND"], [null, null], [null, null], [null, null], ["EOR", "ZPG"], ["LSR", "ZPG"], [null, null], ["PHA", "IMPL"], ["EOR", "#"], ["LSR", "A"], [null, null], ["JMP", "ABS"], ["EOR", "ABS"], ["LSR", "ABS"], [null, null]],
    /* 5 */
    [["BVC", "REL"], ["EOR", "INDY"], [null, null], [null, null], [null, null], ["EOR", "ZPGX"], ["LSR", "ZPGX"], [null, null], ["CLI", "IMPL"], ["EOR", "ABSY"], [null, null], [null, null], [null, null], ["EOR", "ABSX"], ["LSR", "ABSX"], [null, null]],
    /* 6 */
    [["RTS", "IMPL"], ["ADC", "XIND"], [null, null], [null, null], [null, null], ["ADC", "ZPG"], ["ROR", "ZPG"], [null, null], ["PLA", "IMPL"], ["ADC", "#"], ["ROR", "A"], [null, null], ["JMP", "IND"], ["ADC", "ABS"], ["ROR", "ABS"], [null, null]],
    /* 7 */
    [["BVS", "REL"], ["ADC", "INDY"], [null, null], [null, null], [null, null], ["ADC", "ZPGX"], ["ROR", "ZPGX"], [null, null], ["SEI", "IMPL"], ["ADC", "ABSY"], [null, null], [null, null], [null, null], ["ADC", "ABSX"], ["ROR", "ABSX"], [null, null]],
    /* 8 */
    [[null, null], ["STA", "XIND"], [null, null], [null, null], ["STY", "ZPG"], ["STA", "ZPG"], ["STX", "ZPG"], [null, null], ["DEY", "IMPL"], [null, null], ["TXA", "IMPL"], [null, null], ["STY", "ABS"], ["STA", "ABS"], ["STX", "ABS"], [null, null]],
    /* 9 */
    [["BCC", "REL"], ["STA", "INDY"], [null, null], [null, null], ["STY", "ZPGX"], ["STA", "ZPGX"], ["STX", "ZPG,Y"], [null, null], ["TYA", "IMPL"], ["STA", "ABSY"], ["TXS", "IMPL"], [null, null], [null, null], ["STA", "ABSX"], [null, null], [null, null]],
    /* A */
    [["LDY", "#"], ["LDA", "XIND"], ["LDX", "#"], [null, null], ["LDY", "ZPG"], ["LDA", "ZPG"], ["LDX", "ZPG"], [null, null], ["TAY", "IMPL"], ["LDA", "#"], ["TAX", "IMPL"], [null, null], ["LDY", "ABS"], ["LDA", "ABS"], ["LDX", "ABS"], [null, null]],
    /* B */
    [["BCS", "REL"], ["LDA", "INDY"], [null, null], [null, null], ["LDY", "ZPGX"], ["LDA", "ZPGX"], ["LDX", "ZPG,Y"], [null, null], ["CLV", "IMPL"], ["LDA", "ABSY"], ["TSX", "IMPL"], [null, null], ["LDY", "ABSX"], ["LDA", "ABSX"], ["LDX", "ABSY"], [null, null]],
    /* C */
    [["CPY", "#"], ["CMP", "XIND"], [null, null], [null, null], ["CPY", "ZPG"], ["CMP", "ZPG"], ["DEC", "ZPG"], [null, null], ["INY", "IMPL"], ["CMP", "#"], ["DEX", "IMPL"], [null, null], ["CPY", "ABS"], ["CMP", "ABS"], ["DEC", "ABS"], [null, null]],
    /* D */
    [["BNE", "REL"], ["CMP", "INDY"], [null, null], [null, null], [null, null], ["CMP", "ZPGX"], ["DEC", "ZPGX"], [null, null], ["CLD", "IMPL"], ["CMP", "ABSY"], [null, null], [null, null], [null, null], ["CMP", "ABSX"], ["DEC", "ABSX"], [null, null]],
    /* E */
    [["CPX", "#"], ["SBC", "XIND"], [null, null], [null, null], ["CPX", "ZPG"], ["SBC", "ZPG"], ["INC", "ZPG"], [null, null], ["INX", "IMPL"], ["SBC", "#"], ["NOP", "IMPL"], [null, null], ["CPX", "ABS"], ["SBC", "ABS"], ["INC", "ABS"], [null, null]],
    /* F */
    [["BEQ", "REL"], ["SBC", "INDY"], [null, null], [null, null], [null, null], ["SBC", "ZPGX"], ["INC", "ZPGX"], [null, null], ["SED", "IMPL"], ["SBC", "ABSY"], [null, null], [null, null], [null, null], ["SBC", "ABSX"], ["INC", "ABSX"], [null, null]]
  ]);
  var InstructionDecoder = _InstructionDecoder;

  // htdocs/js/Assembler.mjs
  var _Assembler = class _Assembler {
    static permittedSymbolCharactersTest() {
      return /^(?:[a-z]+|[A-Z]+|[0-9]+|_)+$/gm;
    }
    static assemble(asm) {
      let lines = asm.split("\n");
      let outputLines = [];
      let currentAddress = 1536;
      let symbols = [];
      let labels = {};
      lines = lines.filter(generateSymbols);
      lines.forEach(assembleLine);
      outputLines.forEach(replaceLabels);
      return outputLines.join("\n");
      function generateSymbols(line) {
        const symbolDefinitionRegex = /^\s*([^;\r\n\s=]+)\s*=\s*(.*?)\s*(?=\s*(?:;|$))/gm;
        let match = symbolDefinitionRegex.exec(line);
        if (match) {
          if (!_Assembler.permittedSymbolCharactersTest().test(match[1])) {
            console.log("illegal character(s) match", match);
            throw new Error(`Symbol '${match[1]}' contains illegal character(s)`);
          }
          if (symbols[match[1]] !== void 0) {
            throw new Error(`Symbol ${match[1]} has already been defined!`);
          } else {
            console.log(`Added symbol ${match[1]} = ${match[2]}`);
            symbols[match[1]] = match[2];
          }
          return false;
        } else {
          return true;
        }
      }
      function assembleLine(line, lineIndex) {
        const tokens = _Assembler.tokenizeLine(line);
        let parseMode = void 0;
        let addressMode = void 0;
        tokens.forEach((tokenObj, tokenIndex) => {
          const token = tokenObj.token;
          if (parseMode === "ignore") {
            return;
          }
          if (token.charAt(0) === ";") {
            parseMode = "ignore";
            return;
          }
          if (token.charAt(token.length - 1) === ":") {
            let trimmedToken = token.slice(0, -1);
            console.log(`Processing label '${trimmedToken}' at address 0x${currentAddress.toString(16).padStart(4, "0").toUpperCase()}`);
            if (labels[trimmedToken] !== void 0) {
              throw new Error(`Label ${trimmedToken} has already been defined!`);
            } else {
              labels[trimmedToken] = currentAddress.toString(16).padStart(4, "0").toUpperCase();
            }
            return;
          }
          if (parseMode === "operand") {
            const decodedOperand = _Assembler.decodeAddressMode(tokens[tokenIndex - 1].token, token, symbols, labels, currentAddress);
            console.log(`${tokens[tokenIndex - 1].token} ${decodedOperand.operand} ${decodedOperand.mode}`);
            const opcode = InstructionDecoder.getOpcode(tokens[tokenIndex - 1].token, decodedOperand.mode);
            console.log(`${tokens[tokenIndex - 1].token} ${decodedOperand.mode} : ${opcode}`);
            outputLines.push(`<b>${opcode.toString(16).padStart(2, "0").toUpperCase()}</b> ${decodedOperand.operand}<br>`);
            currentAddress += decodedOperand.bytes;
            parseMode = void 0;
            return;
          }
          if (InstructionDecoder.isInstruction(token)) {
            if (tokenIndex === tokens.length - 1) {
              console.log(`${token} (IMPL)`);
              const opcode = InstructionDecoder.getOpcode(tokens[tokenIndex].token, "IMPL");
              outputLines.push(`<b>${opcode.toString(16).padStart(2, "0").toUpperCase()}</b><br>`);
              currentAddress += 1;
            } else {
              parseMode = "operand";
            }
            return;
          }
          throw new Error(`SYNTAX ERROR on line ${lineIndex + 1}: ${line}`);
        });
      }
      function replaceLabels(line, index) {
        const regex = /.+[A-F0-9]*.+__LABEL_(REL|ABS)_([A-F0-9]+)__(\w+)/;
        let match;
        if ((match = regex.exec(line)) !== null) {
          console.log("match: ", match);
          const type = match[1];
          const sourceAddress = match[2];
          const labelName = match[3];
          const labelAddress = labels[labelName];
          console.log(`Replacing '__LABEL_${type}__${labelName}' with ${labelAddress}`);
          switch (type) {
            case "REL":
              const relativeAddress = _Assembler.getRelativeAddress(sourceAddress, labelAddress);
              line = line.replace(`__LABEL_${type}_${sourceAddress}__${labelName}`, relativeAddress);
              break;
            case "ABS":
              const address = _Assembler.bigToLitteEndian(sourceAddress);
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
      const regex = /(\S+)(?=\s|$)/g;
      let tokens = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (line[match.index] === ";") {
          break;
        }
        tokens.push({
          token: match[0],
          column: match.index
        });
      }
      return tokens;
    }
    static decodeAddressMode(instruction, operand, symbols, labels, currentAddress) {
      let regex, match;
      if (match = /(#)(?:([a-z]+|[A-Z]+|[0-9]+|_))+$/g.exec(operand)) {
        if (symbols[match[2]] !== void 0) {
          operand = `#${symbols[match[2]]}`;
        } else {
          throw new Error(`Symbol '${match[2]}' has not been defined!`);
        }
      }
      regex = /^#\$[0-9A-Fa-f]{1,2}$/;
      if (operand.match(regex)) {
        return {
          mode: "#",
          operand: _Assembler.formatOperand(operand.substring(1)),
          bytes: 2
        };
      }
      regex = /^#\$[0-9A-Fa-f]{3,4}$/;
      if (operand.match(regex)) {
        return {
          mode: "#",
          operand: _Assembler.formatOperand(operand.substring(1)),
          bytes: 3
        };
      }
      if (match = /^((?![$][0-9A-Fa-f]{4}$)\w+),Y/gm.exec(operand)) {
        if (symbols[match[1]] !== void 0) {
          operand = `${symbols[match[1]]},Y`;
        } else {
          throw new Error(`Symbol '${match[1]}' has not been defined!`);
        }
      }
      regex = /^(\$[0-9A-Fa-f]{3,4}),Y$/;
      if (operand.match(regex)) {
        return {
          mode: "ABSY",
          operand: _Assembler.formatOperand(operand.slice(0, -2)),
          bytes: 3
        };
      }
      regex = /^\$[0-9A-Fa-f]{1,2},Y$/;
      if (operand.match(regex)) {
        return {
          mode: "ZPG,Y",
          operand: _Assembler.formatOperand(operand.slice(0, -2)),
          bytes: 3
        };
      }
      if (_Assembler.branchOpcodes.includes(instruction)) {
        if (match = /(?:([a-z]+|[A-Z]+|[0-9]+|_))+$/g.exec(operand)) {
          console.log(`Operand '${operand}' appears to be a label`);
          return {
            mode: "REL",
            operand: `__LABEL_REL_${currentAddress.toString(16).padStart(4, "0").toUpperCase()}__` + operand,
            bytes: 2
          };
        }
      } else if (instruction === "JMP") {
        if (match = /(?:([a-z]+|[A-Z]+|[0-9]+|_))+$/g.exec(operand)) {
          console.log(`Operand '${operand}' appears to be a label`);
          return {
            mode: "ABS",
            operand: `__LABEL_ABS_${currentAddress.toString(16).padStart(4, "0").toUpperCase()}__` + operand,
            bytes: 3
          };
        } else {
          throw new Error(`JMP indirect not implemented yet`);
        }
      } else {
        regex = /^\$[0-9A-Fa-f]{1,2}$/;
        if (operand.match(regex)) {
          return {
            mode: "ZPG",
            operand: _Assembler.formatOperand(operand),
            bytes: 2
          };
        }
        regex = /^\$[0-9A-Fa-f]{3,4}$/;
        if (operand.match(regex)) {
          return {
            mode: "ABS",
            operand: _Assembler.formatOperand(operand.substring(1)),
            bytes: 3
          };
        }
      }
      return {
        mode: "??",
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
      if (operand[0] == "$") {
        return _Assembler.bigToLitteEndian(operand.substring(1));
      } else {
      }
    }
    static bigToLitteEndian(hex) {
      if (hex.length === 2) {
        return hex;
      }
      if (hex.length === 3 || hex.length === 4) {
        if (hex.length === 3) {
          hex = "0" + hex;
        }
        return hex.substring(2, 4) + " " + hex.substring(0, 2);
      } else {
        throw new Error("Input must be a two, three or four digit hex number");
      }
    }
    static getRelativeAddress(sourceAddress, targetAddress) {
      console.log("sourceAddress: ", sourceAddress);
      console.log("targetAddress: ", targetAddress);
      let source = parseInt(sourceAddress, 16);
      let target = parseInt(targetAddress, 16);
      let offset = target - source - 2;
      console.log("offset: ", offset);
      if (offset < 0) {
        offset = 256 + offset;
      }
      console.log("offset: ", offset);
      let hexOffset = offset.toString(16).toUpperCase();
      while (hexOffset.length < 2) {
        hexOffset = "0" + hexOffset;
      }
      console.log("hexOffset: ", hexOffset);
      return hexOffset;
    }
  };
  __publicField(_Assembler, "branchOpcodes", ["BPL", "BMI", "BVC", "BVS", "BCC", "BVS", "BNE", "BEQ"]);
  var Assembler = _Assembler;

  // htdocs/js/scripts.js
  window.runCPU = function() {
    document.addEventListener("DOMContentLoaded", function() {
      const displayElement = document.querySelector(".cpu-display");
      const terminalElement = document.querySelector(".terminal");
      const cpu = new CPU({
        displayContainer: displayElement,
        terminalContainer: terminalElement
      });
      const promise = cpu.memory.binaryLoad(65280, "/binary.out?" + Math.random() * Number.MAX_SAFE_INTEGER);
      promise.then(() => {
        cpu.display.requestUpdate();
      });
      cpu.registers.pc = 65280;
      window.cpu = cpu;
      cpu.boot();
    });
  };
  window.assemble = function(asm) {
    const hex = Assembler.assemble(asm.value);
    return hex;
  };
})();
//# sourceMappingURL=scripts-dist.js.map
