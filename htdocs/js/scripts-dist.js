(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a3, b3) => {
    for (var prop in b3 || (b3 = {}))
      if (__hasOwnProp.call(b3, prop))
        __defNormalProp(a3, prop, b3[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b3)) {
        if (__propIsEnum.call(b3, prop))
          __defNormalProp(a3, prop, b3[prop]);
      }
    return a3;
  };
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e4) {
          reject(e4);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e4) {
          reject(e4);
        }
      };
      var step = (x2) => x2.done ? resolve(x2.value) : Promise.resolve(x2.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
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
      const isInstruction = instructionArray[token] != void 0;
      return isInstruction;
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
    [["BRK", "IMPL"], ["ORA", "#"], [null, null], [null, null], [null, null], ["ORA", "ZPG"], ["ASL", "ZPG"], [null, null], ["PHP", "IMPL"], ["ORA", "#"], ["ASL", "IMPL"], [null, null], [null, null], ["ORA", "ABS"], ["ASL", "ABS"], [null, null]],
    /* 1 */
    [["BPL", "REL"], ["ORA", "INDY"], [null, null], [null, null], [null, null], ["ORA", "ZPGX"], ["ASL", "ZPGX"], [null, null], ["CLC", "IMPL"], ["ORA", "ABSY"], [null, null], [null, null], [null, null], ["ORA", "ABSX"], ["ASL", "ABSX"], [null, null]],
    /* 2 */
    [["JSR", "ABS"], ["AND", "XIND"], [null, null], [null, null], ["BIT", "ZPG"], ["AND", "ZPG"], ["ROL", "ZPG"], [null, null], ["PLP", "IMPL"], ["AND", "#"], ["ROL", "IMPL"], [null, null], ["BIT", "ABS"], ["AND", "ABS"], ["ROL", "ABS"], [null, null]],
    /* 3 */
    [["BMI", "REL"], ["AND", "INDY"], [null, null], [null, null], [null, null], ["AND", "ZPGX"], ["ROL", "ZPGX"], [null, null], ["SEC", "IMPL"], ["AND", "ABSY"], [null, null], [null, null], [null, null], ["AND", "ABSX"], ["ROL", "ABSX"], [null, null]],
    /* 4 */
    [["RTI", "IMPL"], ["EOR", "XIND"], [null, null], [null, null], [null, null], ["EOR", "ZPG"], ["LSR", "ZPG"], [null, null], ["PHA", "IMPL"], ["EOR", "#"], ["LSR", "IMPL"], [null, null], ["JMP", "ABS"], ["EOR", "ABS"], ["LSR", "ABS"], [null, null]],
    /* 5 */
    [["BVC", "REL"], ["EOR", "INDY"], [null, null], [null, null], [null, null], ["EOR", "ZPGX"], ["LSR", "ZPGX"], [null, null], ["CLI", "IMPL"], ["EOR", "ABSY"], [null, null], [null, null], [null, null], ["EOR", "ABSX"], ["LSR", "ABSX"], [null, null]],
    /* 6 */
    [["RTS", "IMPL"], ["ADC", "XIND"], [null, null], [null, null], [null, null], ["ADC", "ZPG"], ["ROR", "ZPG"], [null, null], ["PLA", "IMPL"], ["ADC", "#"], ["ROR", "IMPL"], [null, null], ["JMP", "IND"], ["ADC", "ABS"], ["ROR", "ABS"], [null, null]],
    /* 7 */
    [["BVS", "REL"], ["ADC", "INDY"], [null, null], [null, null], [null, null], ["ADC", "ZPGX"], ["ROR", "ZPGX"], [null, null], ["SEI", "IMPL"], ["ADC", "ABSY"], [null, null], [null, null], [null, null], ["ADC", "ABSX"], ["ROR", "ABSX"], [null, null]],
    /* 8 */
    [[null, null], ["STA", "XIND"], [null, null], [null, null], ["STY", "ZPG"], ["STA", "ZPG"], ["STX", "ZPG"], [null, null], ["DEY", "IMPL"], [null, null], ["TXA", "IMPL"], [null, null], ["STY", "ABS"], ["STA", "ABS"], ["STX", "ABS"], [null, null]],
    /* 9 */
    [["BCC", "REL"], ["STA", "INDY"], [null, null], [null, null], ["STY", "ZPGX"], ["STA", "ZPGX"], ["STX", "ZPGY"], [null, null], ["TYA", "IMPL"], ["STA", "ABSY"], ["TXS", "IMPL"], [null, null], [null, null], ["STA", "ABSX"], [null, null], [null, null]],
    /* A */
    [["LDY", "#"], ["LDA", "XIND"], ["LDX", "#"], [null, null], ["LDY", "ZPG"], ["LDA", "ZPG"], ["LDX", "ZPG"], [null, null], ["TAY", "IMPL"], ["LDA", "#"], ["TAX", "IMPL"], [null, null], ["LDY", "ABS"], ["LDA", "ABS"], ["LDX", "ABS"], [null, null]],
    /* B */
    [["BCS", "REL"], ["LDA", "INDY"], [null, null], [null, null], ["LDY", "ZPGX"], ["LDA", "ZPGX"], ["LDX", "ZPGY"], [null, null], ["CLV", "IMPL"], ["LDA", "ABSY"], ["TSX", "IMPL"], [null, null], ["LDY", "ABSX"], ["LDA", "ABSX"], ["LDX", "ABSY"], [null, null]],
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
        line = /^([^;]*)/g.exec(line)[1].trim();
        line = _Assembler.substituteCharacterLiterals(line);
        const symbolDefinitionRegex = /(\w+)\s*=\s*(\$?\w+)/g;
        let match = symbolDefinitionRegex.exec(line);
        if (match) {
          if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(match[1])) {
            if (symbols[match[1]] !== void 0) {
              throw new Error(`Symbol ${match[1]} has already been defined!`);
            } else {
              console.log(`Added symbol ${match[1]} = ${match[2]}`);
              symbols[match[1]] = match[2];
            }
          } else {
            console.log("illegal character(s) match", match);
            throw new Error(`Symbol '${match[1]}' contains illegal character(s)`);
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
            try {
              const instruction = tokens[tokenIndex - 1].token;
              const decodedOperand = _Assembler.decodeAddressMode(instruction, token, symbols, labels, currentAddress);
              const opcode = InstructionDecoder.getOpcode(instruction, decodedOperand.mode);
              console.log(`${instruction} ${decodedOperand.mode} : ${opcode}`);
              outputLines.push(`<b>${opcode.toString(16).padStart(2, "0").toUpperCase()}</b> ${decodedOperand.operand}<br>`);
              currentAddress += decodedOperand.bytes;
            } catch (e4) {
              throw new Error(`${e4}: ${lineIndex + 1}: ${line}`);
            }
            parseMode = void 0;
            return;
          }
          if (parseMode === "directive") {
            const instruction = tokens[tokenIndex - 1].token;
            let operand = token;
            if (instruction.toUpperCase() === ".WORD") {
              console.log(`.WORD ${operand}`);
              if (!operand.match(/^\$[0-9A-Fa-f]{4}$/)) {
                if (symbols[operand] !== void 0) {
                  operand = `${symbols[operand]}`;
                } else {
                  outputLines.push(`__LABEL_ABS_${currentAddress.toString(16).padStart(4, "0").toUpperCase()}__` + operand + "<br>");
                  parseMode = void 0;
                  return;
                }
              }
              if (operand.match(/^\$[0-9A-Fa-f]{4}$/)) {
                outputLines.push(_Assembler.formatOperand(operand) + "<br>");
                parseMode = void 0;
                return;
              }
            } else if (instruction.toUpperCase() === ".BYTE") {
              console.log(`.BYTE ${operand}`);
              if (!operand.match(/^\$[0-9A-Fa-f]{2}$/)) {
                if (symbols[operand] !== void 0) {
                  operand = `${symbols[operand]}`;
                } else {
                  throw new Error(`Symbol or label '${operand}' has not been defined!`);
                }
              }
              if (operand.match(/^\$[0-9A-Fa-f]{2}$/)) {
                outputLines.push(_Assembler.formatOperand(operand) + "<br>");
                parseMode = void 0;
                return;
              }
            } else if (instruction.toUpperCase() === ".ORG") {
              parseMode = void 0;
              return;
            }
          }
          if ([".WORD", ".BYTE", ".ORG"].includes(token.toUpperCase())) {
            parseMode = "directive";
            return;
          }
          if (InstructionDecoder.isInstruction(token)) {
            if (tokenIndex === tokens.length - 1) {
              console.log(`${token} (IMPL)`);
              try {
                const opcode = InstructionDecoder.getOpcode(tokens[tokenIndex].token, "IMPL");
                outputLines.push(`<b>${opcode.toString(16).padStart(2, "0").toUpperCase()}</b><br>`);
              } catch (e4) {
                throw new Error(`${e4}: ${lineIndex + 1}: ${line}`);
              }
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
        const regex = /__LABEL_(REL|ABS)_([A-F0-9]+)__(\w+)/;
        let match;
        if ((match = regex.exec(line)) !== null) {
          console.log("match label postprocess: ", match);
          const type = match[1];
          const sourceAddress = match[2];
          const labelName = match[3];
          const labelAddress = labels[labelName];
          if (labelAddress === void 0) {
            console.log("lables: ", labels);
            throw new Error(`Label '${labelName}' has not been defined!`);
          }
          console.log(`Replacing '__LABEL_${type}__${labelName}' with ${labelAddress}`);
          switch (type) {
            case "REL":
              const relativeAddress = _Assembler.getRelativeAddress(sourceAddress, labelAddress);
              line = line.replace(`__LABEL_${type}_${sourceAddress}__${labelName}`, relativeAddress);
              break;
            case "ABS":
              const address = _Assembler.bigToLitteEndian(labelAddress);
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
      let regex, match, operandValue;
      operand = _Assembler.substituteCharacterLiterals(operand);
      if (_Assembler.branchOpcodes.includes(instruction)) {
        if (match = /(?:([a-z]+|[A-Z]+|[0-9]+|_))+$/g.exec(operand)) {
          console.log(`Operand '${operand}' appears to be a label`);
          return {
            mode: "REL",
            operand: `__LABEL_REL_${currentAddress.toString(16).padStart(4, "0").toUpperCase()}__` + operand,
            bytes: 2
          };
        }
      } else if (instruction === "JMP" || instruction === "JSR") {
        console.log(`JMP/JSR`);
        if (match = /(?:([a-z]+|[A-Z]+|[0-9]+|_))+$/g.exec(operand)) {
          console.log(`Operand '${operand}' appears to be a label (JMP/JSR)`);
          return {
            mode: "ABS",
            operand: `__LABEL_ABS_${currentAddress.toString(16).padStart(4, "0").toUpperCase()}__` + operand,
            bytes: 3
          };
        } else if (match = /^\$([0-9A-Fa-f]{3,4})$/g.exec(operand)) {
          return {
            mode: "ABS",
            operand: _Assembler.formatOperand(match[1].substring(1)),
            bytes: 3
          };
        } else if (match = /\((?:([a-z]+|[A-Z]+|[0-9]+|_))+\)$/g.exec(operand)) {
          if (symbols[match[1]] !== void 0) {
            operandValue = `${symbols[match[1]]}`;
          } else {
            throw new Error(`Symbol '${match[1]}' has not been defined!`);
          }
          return {
            mode: "IND",
            operand: _Assembler.formatOperand(operandValue),
            bytes: 3
          };
        } else if (match = /^\(\$([0-9A-Fa-f]{3,4})\)$/g.exec(operand)) {
          return {
            mode: "IND",
            operand: _Assembler.formatOperand(match[1].substring(1)),
            bytes: 3
          };
        }
        throw new Error(`JMP mode not implemented yet`);
      }
      regex = /^#(.+)$/g;
      if (match = regex.exec(operand)) {
        operandValue = match[1];
        regex = /^\$[0-9A-Fa-f]{1,2}$/;
        if (!operandValue.match(regex)) {
          if (operandValue.match(_Assembler.acceptableSymbol)) {
            if (symbols[operandValue] !== void 0) {
              operandValue = `${symbols[operandValue]}`;
            } else {
              throw new Error(`Symbol '${operandValue}' has not been defined!`);
            }
          }
        }
        if (operandValue.match(regex)) {
          return {
            mode: "#",
            operand: _Assembler.formatOperand(operandValue),
            bytes: 2
          };
        }
      }
      regex = /^(\$?\w+),([X|Y])$/;
      if (match = regex.exec(operand)) {
        operandValue = match[1];
        regex = /^\$[0-9A-Fa-f]{1,4}$/;
        if (!operandValue.match(regex)) {
          if (operandValue.match(_Assembler.acceptableSymbol)) {
            if (symbols[operandValue] !== void 0) {
              operandValue = `${symbols[operandValue]}`;
            } else {
              throw new Error(`Symbol '${operandValue}' has not been defined!`);
            }
          }
        }
        if (operandValue.match(regex)) {
          return {
            mode: (operandValue.length === 3 ? "ZPG" : "ABS") + match[2],
            operand: _Assembler.formatOperand(operandValue),
            bytes: 3
          };
        }
      }
      regex = /^\((\$?\w+),X\)$/;
      if (match = regex.exec(operand)) {
        operandValue = match[1];
        regex = /^\$[0-9A-Fa-f]{1,2}$/;
        if (!operandValue.match(regex)) {
          if (operandValue.match(_Assembler.acceptableSymbol)) {
            if (symbols[operandValue] !== void 0) {
              operandValue = `${symbols[operandValue]}`;
            } else {
              throw new Error(`Symbol '${operandValue}' has not been defined!`);
            }
          }
        }
        if (operandValue.match(regex)) {
          return {
            mode: "XIND",
            operand: _Assembler.formatOperand(operandValue),
            bytes: 2
          };
        }
      }
      regex = /^\((\$?\w+)\),Y$/;
      if (match = regex.exec(operand)) {
        operandValue = match[1];
        regex = /^\$[0-9A-Fa-f]{1,2}$/;
        if (!operandValue.match(regex)) {
          if (operandValue.match(_Assembler.acceptableSymbol)) {
            if (symbols[operandValue] !== void 0) {
              operandValue = `${symbols[operandValue]}`;
            } else {
              throw new Error(`Symbol '${operandValue}' has not been defined!`);
            }
          }
        }
        if (operandValue.match(regex)) {
          return {
            mode: "INDY",
            operand: _Assembler.formatOperand(operandValue),
            bytes: 2
          };
        }
      }
      if (match = /^([a-zA-Z0-9]+)$/g.exec(operand)) {
        if (symbols[match[1]] !== void 0) {
          operand = `${symbols[match[1]]}`;
        } else {
          throw new Error(`Symbol '${match[1]}' has not been defined!`);
        }
      }
      if (match = /^\$[0-9A-Fa-f]{3,4}$/g.exec(operand)) {
        return {
          mode: "ABS",
          operand: _Assembler.formatOperand(operand),
          bytes: 3
        };
      }
      if (match = /^\$[0-9A-Fa-f]{1,2}$/g.exec(operand)) {
        return {
          mode: "ZPG",
          operand: _Assembler.formatOperand(operand),
          bytes: 3
        };
      }
      return {
        mode: "??",
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
        return "$" + p1.charCodeAt(0).toString(16);
      });
      if (newLine !== line) {
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
      let source = parseInt(sourceAddress, 16);
      let target = parseInt(targetAddress, 16);
      let offset = target - source - 2;
      if (offset < 0) {
        offset = 256 + offset;
      }
      let hexOffset = offset.toString(16).toUpperCase();
      while (hexOffset.length < 2) {
        hexOffset = "0" + hexOffset;
      }
      return hexOffset;
    }
  };
  __publicField(_Assembler, "acceptableSymbol", /^[A-Za-z_][A-Za-z0-9_]*$/);
  __publicField(_Assembler, "branchOpcodes", ["BPL", "BMI", "BVC", "BVS", "BCC", "BCS", "BVS", "BNE", "BEQ"]);
  var Assembler = _Assembler;

  // htdocs/js/Memory.mjs
  var _Memory = class _Memory {
    constructor() {
      this.initMemory();
      if (!Array.prototype.findLastIndex) {
        Array.prototype.findLastIndex = function(callback, thisArg) {
          for (let i4 = this.length - 1; i4 >= 0; i4--) {
            if (callback.call(thisArg, this[i4], i4, this))
              return i4;
          }
          return -1;
        };
      }
      return this;
    }
    initMemory() {
      this._mem = new Uint8Array(_Memory.MEM_SIZE);
      this._patches = [];
    }
    readByte(location) {
      const foundPatch = this._patches.findLastIndex((patch) => {
        if (location >= patch.start && location <= patch.end) {
          return true;
        }
      });
      if (foundPatch > -1) {
        return this._patches[foundPatch].readCallback(location);
      } else {
        return this._mem[location];
      }
    }
    writeByte(location, value) {
      const foundPatch = this._patches.findLastIndex((patch) => {
        if (location >= patch.start && location <= patch.end) {
          return true;
        }
      });
      if (foundPatch > -1) {
        if (typeof this._patches[foundPatch].writeCallback == "function") {
          this._patches[foundPatch].writeCallback(location, value);
        }
      } else {
        this._mem[location] = value;
      }
    }
    hexLoad(start, hexString) {
      const bytes = hexString.split(" ");
      bytes.forEach((byte) => {
        this.writeByte(start++, parseInt(byte, 16));
      });
    }
    binaryLoad(start, url) {
      return __async(this, null, function* () {
        const response = yield fetch(url);
        const buffer = yield response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        bytes.forEach((byte) => {
          this.writeByte(start++, byte);
        });
        console.log(`Loaded ${bytes.length} bytes from '${url}'`);
      });
    }
    addPatch(patch) {
      this._patches.push(patch);
    }
  };
  __publicField(_Memory, "MEM_SIZE", 64 * 1024);
  var Memory = _Memory;

  // node_modules/@lit/reactive-element/css-tag.js
  var t = globalThis;
  var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
  var s = Symbol();
  var o = /* @__PURE__ */ new WeakMap();
  var n = class {
    constructor(t3, e4, o4) {
      if (this._$cssResult$ = true, o4 !== s)
        throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t3, this.t = e4;
    }
    get styleSheet() {
      let t3 = this.o;
      const s4 = this.t;
      if (e && void 0 === t3) {
        const e4 = void 0 !== s4 && 1 === s4.length;
        e4 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t3));
      }
      return t3;
    }
    toString() {
      return this.cssText;
    }
  };
  var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
  var i = (t3, ...e4) => {
    const o4 = 1 === t3.length ? t3[0] : e4.reduce((e5, s4, o5) => e5 + ((t4) => {
      if (true === t4._$cssResult$)
        return t4.cssText;
      if ("number" == typeof t4)
        return t4;
      throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
    })(s4) + t3[o5 + 1], t3[0]);
    return new n(o4, t3, s);
  };
  var S = (s4, o4) => {
    if (e)
      s4.adoptedStyleSheets = o4.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
    else
      for (const e4 of o4) {
        const o5 = document.createElement("style"), n4 = t.litNonce;
        void 0 !== n4 && o5.setAttribute("nonce", n4), o5.textContent = e4.cssText, s4.appendChild(o5);
      }
  };
  var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
    let e4 = "";
    for (const s4 of t4.cssRules)
      e4 += s4.cssText;
    return r(e4);
  })(t3) : t3;

  // node_modules/@lit/reactive-element/reactive-element.js
  var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: r2, getOwnPropertyNames: h, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
  var a = globalThis;
  var c2 = a.trustedTypes;
  var l = c2 ? c2.emptyScript : "";
  var p = a.reactiveElementPolyfillSupport;
  var d = (t3, s4) => t3;
  var u = { toAttribute(t3, s4) {
    switch (s4) {
      case Boolean:
        t3 = t3 ? l : null;
        break;
      case Object:
      case Array:
        t3 = null == t3 ? t3 : JSON.stringify(t3);
    }
    return t3;
  }, fromAttribute(t3, s4) {
    let i4 = t3;
    switch (s4) {
      case Boolean:
        i4 = null !== t3;
        break;
      case Number:
        i4 = null === t3 ? null : Number(t3);
        break;
      case Object:
      case Array:
        try {
          i4 = JSON.parse(t3);
        } catch (t4) {
          i4 = null;
        }
    }
    return i4;
  } };
  var f = (t3, s4) => !i2(t3, s4);
  var y = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
  var _a, _b;
  (_a = Symbol.metadata) != null ? _a : Symbol.metadata = Symbol("metadata"), (_b = a.litPropertyMetadata) != null ? _b : a.litPropertyMetadata = /* @__PURE__ */ new WeakMap();
  var b = class extends HTMLElement {
    static addInitializer(t3) {
      var _a6;
      this._$Ei(), ((_a6 = this.l) != null ? _a6 : this.l = []).push(t3);
    }
    static get observedAttributes() {
      return this.finalize(), this._$Eh && [...this._$Eh.keys()];
    }
    static createProperty(t3, s4 = y) {
      if (s4.state && (s4.attribute = false), this._$Ei(), this.elementProperties.set(t3, s4), !s4.noAccessor) {
        const i4 = Symbol(), r5 = this.getPropertyDescriptor(t3, i4, s4);
        void 0 !== r5 && e2(this.prototype, t3, r5);
      }
    }
    static getPropertyDescriptor(t3, s4, i4) {
      var _a6;
      const { get: e4, set: h3 } = (_a6 = r2(this.prototype, t3)) != null ? _a6 : { get() {
        return this[s4];
      }, set(t4) {
        this[s4] = t4;
      } };
      return { get() {
        return e4 == null ? void 0 : e4.call(this);
      }, set(s5) {
        const r5 = e4 == null ? void 0 : e4.call(this);
        h3.call(this, s5), this.requestUpdate(t3, r5, i4);
      }, configurable: true, enumerable: true };
    }
    static getPropertyOptions(t3) {
      var _a6;
      return (_a6 = this.elementProperties.get(t3)) != null ? _a6 : y;
    }
    static _$Ei() {
      if (this.hasOwnProperty(d("elementProperties")))
        return;
      const t3 = n2(this);
      t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
    }
    static finalize() {
      if (this.hasOwnProperty(d("finalized")))
        return;
      if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
        const t4 = this.properties, s4 = [...h(t4), ...o2(t4)];
        for (const i4 of s4)
          this.createProperty(i4, t4[i4]);
      }
      const t3 = this[Symbol.metadata];
      if (null !== t3) {
        const s4 = litPropertyMetadata.get(t3);
        if (void 0 !== s4)
          for (const [t4, i4] of s4)
            this.elementProperties.set(t4, i4);
      }
      this._$Eh = /* @__PURE__ */ new Map();
      for (const [t4, s4] of this.elementProperties) {
        const i4 = this._$Eu(t4, s4);
        void 0 !== i4 && this._$Eh.set(i4, t4);
      }
      this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(s4) {
      const i4 = [];
      if (Array.isArray(s4)) {
        const e4 = new Set(s4.flat(1 / 0).reverse());
        for (const s5 of e4)
          i4.unshift(c(s5));
      } else
        void 0 !== s4 && i4.push(c(s4));
      return i4;
    }
    static _$Eu(t3, s4) {
      const i4 = s4.attribute;
      return false === i4 ? void 0 : "string" == typeof i4 ? i4 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
    }
    constructor() {
      super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
    }
    _$Ev() {
      var _a6;
      this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (_a6 = this.constructor.l) == null ? void 0 : _a6.forEach((t3) => t3(this));
    }
    addController(t3) {
      var _a6, _b3;
      ((_a6 = this._$EO) != null ? _a6 : this._$EO = /* @__PURE__ */ new Set()).add(t3), void 0 !== this.renderRoot && this.isConnected && ((_b3 = t3.hostConnected) == null ? void 0 : _b3.call(t3));
    }
    removeController(t3) {
      var _a6;
      (_a6 = this._$EO) == null ? void 0 : _a6.delete(t3);
    }
    _$E_() {
      const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
      for (const i4 of s4.keys())
        this.hasOwnProperty(i4) && (t3.set(i4, this[i4]), delete this[i4]);
      t3.size > 0 && (this._$Ep = t3);
    }
    createRenderRoot() {
      var _a6;
      const t3 = (_a6 = this.shadowRoot) != null ? _a6 : this.attachShadow(this.constructor.shadowRootOptions);
      return S(t3, this.constructor.elementStyles), t3;
    }
    connectedCallback() {
      var _a6, _b3;
      (_a6 = this.renderRoot) != null ? _a6 : this.renderRoot = this.createRenderRoot(), this.enableUpdating(true), (_b3 = this._$EO) == null ? void 0 : _b3.forEach((t3) => {
        var _a7;
        return (_a7 = t3.hostConnected) == null ? void 0 : _a7.call(t3);
      });
    }
    enableUpdating(t3) {
    }
    disconnectedCallback() {
      var _a6;
      (_a6 = this._$EO) == null ? void 0 : _a6.forEach((t3) => {
        var _a7;
        return (_a7 = t3.hostDisconnected) == null ? void 0 : _a7.call(t3);
      });
    }
    attributeChangedCallback(t3, s4, i4) {
      this._$AK(t3, i4);
    }
    _$EC(t3, s4) {
      var _a6;
      const i4 = this.constructor.elementProperties.get(t3), e4 = this.constructor._$Eu(t3, i4);
      if (void 0 !== e4 && true === i4.reflect) {
        const r5 = (void 0 !== ((_a6 = i4.converter) == null ? void 0 : _a6.toAttribute) ? i4.converter : u).toAttribute(s4, i4.type);
        this._$Em = t3, null == r5 ? this.removeAttribute(e4) : this.setAttribute(e4, r5), this._$Em = null;
      }
    }
    _$AK(t3, s4) {
      var _a6;
      const i4 = this.constructor, e4 = i4._$Eh.get(t3);
      if (void 0 !== e4 && this._$Em !== e4) {
        const t4 = i4.getPropertyOptions(e4), r5 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== ((_a6 = t4.converter) == null ? void 0 : _a6.fromAttribute) ? t4.converter : u;
        this._$Em = e4, this[e4] = r5.fromAttribute(s4, t4.type), this._$Em = null;
      }
    }
    requestUpdate(t3, s4, i4) {
      var _a6;
      if (void 0 !== t3) {
        if (i4 != null ? i4 : i4 = this.constructor.getPropertyOptions(t3), !((_a6 = i4.hasChanged) != null ? _a6 : f)(this[t3], s4))
          return;
        this.P(t3, s4, i4);
      }
      false === this.isUpdatePending && (this._$ES = this._$ET());
    }
    P(t3, s4, i4) {
      var _a6;
      this._$AL.has(t3) || this._$AL.set(t3, s4), true === i4.reflect && this._$Em !== t3 && ((_a6 = this._$Ej) != null ? _a6 : this._$Ej = /* @__PURE__ */ new Set()).add(t3);
    }
    _$ET() {
      return __async(this, null, function* () {
        this.isUpdatePending = true;
        try {
          yield this._$ES;
        } catch (t4) {
          Promise.reject(t4);
        }
        const t3 = this.scheduleUpdate();
        return null != t3 && (yield t3), !this.isUpdatePending;
      });
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      var _a6, _b3;
      if (!this.isUpdatePending)
        return;
      if (!this.hasUpdated) {
        if ((_a6 = this.renderRoot) != null ? _a6 : this.renderRoot = this.createRenderRoot(), this._$Ep) {
          for (const [t5, s5] of this._$Ep)
            this[t5] = s5;
          this._$Ep = void 0;
        }
        const t4 = this.constructor.elementProperties;
        if (t4.size > 0)
          for (const [s5, i4] of t4)
            true !== i4.wrapped || this._$AL.has(s5) || void 0 === this[s5] || this.P(s5, this[s5], i4);
      }
      let t3 = false;
      const s4 = this._$AL;
      try {
        t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), (_b3 = this._$EO) == null ? void 0 : _b3.forEach((t4) => {
          var _a7;
          return (_a7 = t4.hostUpdate) == null ? void 0 : _a7.call(t4);
        }), this.update(s4)) : this._$EU();
      } catch (s5) {
        throw t3 = false, this._$EU(), s5;
      }
      t3 && this._$AE(s4);
    }
    willUpdate(t3) {
    }
    _$AE(t3) {
      var _a6;
      (_a6 = this._$EO) == null ? void 0 : _a6.forEach((t4) => {
        var _a7;
        return (_a7 = t4.hostUpdated) == null ? void 0 : _a7.call(t4);
      }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
    }
    _$EU() {
      this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$ES;
    }
    shouldUpdate(t3) {
      return true;
    }
    update(t3) {
      this._$Ej && (this._$Ej = this._$Ej.forEach((t4) => this._$EC(t4, this[t4]))), this._$EU();
    }
    updated(t3) {
    }
    firstUpdated(t3) {
    }
  };
  var _a2;
  b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[d("elementProperties")] = /* @__PURE__ */ new Map(), b[d("finalized")] = /* @__PURE__ */ new Map(), p == null ? void 0 : p({ ReactiveElement: b }), ((_a2 = a.reactiveElementVersions) != null ? _a2 : a.reactiveElementVersions = []).push("2.0.4");

  // node_modules/lit-html/lit-html.js
  var t2 = globalThis;
  var i3 = t2.trustedTypes;
  var s2 = i3 ? i3.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
  var e3 = "$lit$";
  var h2 = `lit$${(Math.random() + "").slice(9)}$`;
  var o3 = "?" + h2;
  var n3 = `<${o3}>`;
  var r3 = document;
  var l2 = () => r3.createComment("");
  var c3 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
  var a2 = Array.isArray;
  var u2 = (t3) => a2(t3) || "function" == typeof (t3 == null ? void 0 : t3[Symbol.iterator]);
  var d2 = "[ 	\n\f\r]";
  var f2 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var v = /-->/g;
  var _ = />/g;
  var m = RegExp(`>|${d2}(?:([^\\s"'>=/]+)(${d2}*=${d2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
  var p2 = /'/g;
  var g = /"/g;
  var $ = /^(?:script|style|textarea|title)$/i;
  var y2 = (t3) => (i4, ...s4) => ({ _$litType$: t3, strings: i4, values: s4 });
  var x = y2(1);
  var b2 = y2(2);
  var w = Symbol.for("lit-noChange");
  var T = Symbol.for("lit-nothing");
  var A = /* @__PURE__ */ new WeakMap();
  var E = r3.createTreeWalker(r3, 129);
  function C(t3, i4) {
    if (!Array.isArray(t3) || !t3.hasOwnProperty("raw"))
      throw Error("invalid template strings array");
    return void 0 !== s2 ? s2.createHTML(i4) : i4;
  }
  var P = (t3, i4) => {
    const s4 = t3.length - 1, o4 = [];
    let r5, l3 = 2 === i4 ? "<svg>" : "", c4 = f2;
    for (let i5 = 0; i5 < s4; i5++) {
      const s5 = t3[i5];
      let a3, u3, d3 = -1, y3 = 0;
      for (; y3 < s5.length && (c4.lastIndex = y3, u3 = c4.exec(s5), null !== u3); )
        y3 = c4.lastIndex, c4 === f2 ? "!--" === u3[1] ? c4 = v : void 0 !== u3[1] ? c4 = _ : void 0 !== u3[2] ? ($.test(u3[2]) && (r5 = RegExp("</" + u3[2], "g")), c4 = m) : void 0 !== u3[3] && (c4 = m) : c4 === m ? ">" === u3[0] ? (c4 = r5 != null ? r5 : f2, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? m : '"' === u3[3] ? g : p2) : c4 === g || c4 === p2 ? c4 = m : c4 === v || c4 === _ ? c4 = f2 : (c4 = m, r5 = void 0);
      const x2 = c4 === m && t3[i5 + 1].startsWith("/>") ? " " : "";
      l3 += c4 === f2 ? s5 + n3 : d3 >= 0 ? (o4.push(a3), s5.slice(0, d3) + e3 + s5.slice(d3) + h2 + x2) : s5 + h2 + (-2 === d3 ? i5 : x2);
    }
    return [C(t3, l3 + (t3[s4] || "<?>") + (2 === i4 ? "</svg>" : "")), o4];
  };
  var V = class _V {
    constructor({ strings: t3, _$litType$: s4 }, n4) {
      let r5;
      this.parts = [];
      let c4 = 0, a3 = 0;
      const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = P(t3, s4);
      if (this.el = _V.createElement(f3, n4), E.currentNode = this.el.content, 2 === s4) {
        const t4 = this.el.content.firstChild;
        t4.replaceWith(...t4.childNodes);
      }
      for (; null !== (r5 = E.nextNode()) && d3.length < u3; ) {
        if (1 === r5.nodeType) {
          if (r5.hasAttributes())
            for (const t4 of r5.getAttributeNames())
              if (t4.endsWith(e3)) {
                const i4 = v2[a3++], s5 = r5.getAttribute(t4).split(h2), e4 = /([.?@])?(.*)/.exec(i4);
                d3.push({ type: 1, index: c4, name: e4[2], strings: s5, ctor: "." === e4[1] ? k : "?" === e4[1] ? H : "@" === e4[1] ? I : R }), r5.removeAttribute(t4);
              } else
                t4.startsWith(h2) && (d3.push({ type: 6, index: c4 }), r5.removeAttribute(t4));
          if ($.test(r5.tagName)) {
            const t4 = r5.textContent.split(h2), s5 = t4.length - 1;
            if (s5 > 0) {
              r5.textContent = i3 ? i3.emptyScript : "";
              for (let i4 = 0; i4 < s5; i4++)
                r5.append(t4[i4], l2()), E.nextNode(), d3.push({ type: 2, index: ++c4 });
              r5.append(t4[s5], l2());
            }
          }
        } else if (8 === r5.nodeType)
          if (r5.data === o3)
            d3.push({ type: 2, index: c4 });
          else {
            let t4 = -1;
            for (; -1 !== (t4 = r5.data.indexOf(h2, t4 + 1)); )
              d3.push({ type: 7, index: c4 }), t4 += h2.length - 1;
          }
        c4++;
      }
    }
    static createElement(t3, i4) {
      const s4 = r3.createElement("template");
      return s4.innerHTML = t3, s4;
    }
  };
  function N(t3, i4, s4 = t3, e4) {
    var _a6, _b2, _c;
    if (i4 === w)
      return i4;
    let h3 = void 0 !== e4 ? (_a6 = s4._$Co) == null ? void 0 : _a6[e4] : s4._$Cl;
    const o4 = c3(i4) ? void 0 : i4._$litDirective$;
    return (h3 == null ? void 0 : h3.constructor) !== o4 && ((_b2 = h3 == null ? void 0 : h3._$AO) == null ? void 0 : _b2.call(h3, false), void 0 === o4 ? h3 = void 0 : (h3 = new o4(t3), h3._$AT(t3, s4, e4)), void 0 !== e4 ? ((_c = s4._$Co) != null ? _c : s4._$Co = [])[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i4 = N(t3, h3._$AS(t3, i4.values), h3, e4)), i4;
  }
  var S2 = class {
    constructor(t3, i4) {
      this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i4;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t3) {
      var _a6;
      const { el: { content: i4 }, parts: s4 } = this._$AD, e4 = ((_a6 = t3 == null ? void 0 : t3.creationScope) != null ? _a6 : r3).importNode(i4, true);
      E.currentNode = e4;
      let h3 = E.nextNode(), o4 = 0, n4 = 0, l3 = s4[0];
      for (; void 0 !== l3; ) {
        if (o4 === l3.index) {
          let i5;
          2 === l3.type ? i5 = new M(h3, h3.nextSibling, this, t3) : 1 === l3.type ? i5 = new l3.ctor(h3, l3.name, l3.strings, this, t3) : 6 === l3.type && (i5 = new L(h3, this, t3)), this._$AV.push(i5), l3 = s4[++n4];
        }
        o4 !== (l3 == null ? void 0 : l3.index) && (h3 = E.nextNode(), o4++);
      }
      return E.currentNode = r3, e4;
    }
    p(t3) {
      let i4 = 0;
      for (const s4 of this._$AV)
        void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i4), i4 += s4.strings.length - 2) : s4._$AI(t3[i4])), i4++;
    }
  };
  var M = class _M {
    get _$AU() {
      var _a6, _b2;
      return (_b2 = (_a6 = this._$AM) == null ? void 0 : _a6._$AU) != null ? _b2 : this._$Cv;
    }
    constructor(t3, i4, s4, e4) {
      var _a6;
      this.type = 2, this._$AH = T, this._$AN = void 0, this._$AA = t3, this._$AB = i4, this._$AM = s4, this.options = e4, this._$Cv = (_a6 = e4 == null ? void 0 : e4.isConnected) != null ? _a6 : true;
    }
    get parentNode() {
      let t3 = this._$AA.parentNode;
      const i4 = this._$AM;
      return void 0 !== i4 && 11 === (t3 == null ? void 0 : t3.nodeType) && (t3 = i4.parentNode), t3;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t3, i4 = this) {
      t3 = N(this, t3, i4), c3(t3) ? t3 === T || null == t3 || "" === t3 ? (this._$AH !== T && this._$AR(), this._$AH = T) : t3 !== this._$AH && t3 !== w && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : u2(t3) ? this.k(t3) : this._(t3);
    }
    S(t3) {
      return this._$AA.parentNode.insertBefore(t3, this._$AB);
    }
    T(t3) {
      this._$AH !== t3 && (this._$AR(), this._$AH = this.S(t3));
    }
    _(t3) {
      this._$AH !== T && c3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(r3.createTextNode(t3)), this._$AH = t3;
    }
    $(t3) {
      var _a6;
      const { values: i4, _$litType$: s4 } = t3, e4 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = V.createElement(C(s4.h, s4.h[0]), this.options)), s4);
      if (((_a6 = this._$AH) == null ? void 0 : _a6._$AD) === e4)
        this._$AH.p(i4);
      else {
        const t4 = new S2(e4, this), s5 = t4.u(this.options);
        t4.p(i4), this.T(s5), this._$AH = t4;
      }
    }
    _$AC(t3) {
      let i4 = A.get(t3.strings);
      return void 0 === i4 && A.set(t3.strings, i4 = new V(t3)), i4;
    }
    k(t3) {
      a2(this._$AH) || (this._$AH = [], this._$AR());
      const i4 = this._$AH;
      let s4, e4 = 0;
      for (const h3 of t3)
        e4 === i4.length ? i4.push(s4 = new _M(this.S(l2()), this.S(l2()), this, this.options)) : s4 = i4[e4], s4._$AI(h3), e4++;
      e4 < i4.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i4.length = e4);
    }
    _$AR(t3 = this._$AA.nextSibling, i4) {
      var _a6;
      for ((_a6 = this._$AP) == null ? void 0 : _a6.call(this, false, true, i4); t3 && t3 !== this._$AB; ) {
        const i5 = t3.nextSibling;
        t3.remove(), t3 = i5;
      }
    }
    setConnected(t3) {
      var _a6;
      void 0 === this._$AM && (this._$Cv = t3, (_a6 = this._$AP) == null ? void 0 : _a6.call(this, t3));
    }
  };
  var R = class {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t3, i4, s4, e4, h3) {
      this.type = 1, this._$AH = T, this._$AN = void 0, this.element = t3, this.name = i4, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = T;
    }
    _$AI(t3, i4 = this, s4, e4) {
      const h3 = this.strings;
      let o4 = false;
      if (void 0 === h3)
        t3 = N(this, t3, i4, 0), o4 = !c3(t3) || t3 !== this._$AH && t3 !== w, o4 && (this._$AH = t3);
      else {
        const e5 = t3;
        let n4, r5;
        for (t3 = h3[0], n4 = 0; n4 < h3.length - 1; n4++)
          r5 = N(this, e5[s4 + n4], i4, n4), r5 === w && (r5 = this._$AH[n4]), o4 || (o4 = !c3(r5) || r5 !== this._$AH[n4]), r5 === T ? t3 = T : t3 !== T && (t3 += (r5 != null ? r5 : "") + h3[n4 + 1]), this._$AH[n4] = r5;
      }
      o4 && !e4 && this.j(t3);
    }
    j(t3) {
      t3 === T ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 != null ? t3 : "");
    }
  };
  var k = class extends R {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(t3) {
      this.element[this.name] = t3 === T ? void 0 : t3;
    }
  };
  var H = class extends R {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(t3) {
      this.element.toggleAttribute(this.name, !!t3 && t3 !== T);
    }
  };
  var I = class extends R {
    constructor(t3, i4, s4, e4, h3) {
      super(t3, i4, s4, e4, h3), this.type = 5;
    }
    _$AI(t3, i4 = this) {
      var _a6;
      if ((t3 = (_a6 = N(this, t3, i4, 0)) != null ? _a6 : T) === w)
        return;
      const s4 = this._$AH, e4 = t3 === T && s4 !== T || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== T && (s4 === T || e4);
      e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
    }
    handleEvent(t3) {
      var _a6, _b2;
      "function" == typeof this._$AH ? this._$AH.call((_b2 = (_a6 = this.options) == null ? void 0 : _a6.host) != null ? _b2 : this.element, t3) : this._$AH.handleEvent(t3);
    }
  };
  var L = class {
    constructor(t3, i4, s4) {
      this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i4, this.options = s4;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3) {
      N(this, t3);
    }
  };
  var Z = t2.litHtmlPolyfillSupport;
  var _a3;
  Z == null ? void 0 : Z(V, M), ((_a3 = t2.litHtmlVersions) != null ? _a3 : t2.litHtmlVersions = []).push("3.1.2");
  var j = (t3, i4, s4) => {
    var _a6, _b2;
    const e4 = (_a6 = s4 == null ? void 0 : s4.renderBefore) != null ? _a6 : i4;
    let h3 = e4._$litPart$;
    if (void 0 === h3) {
      const t4 = (_b2 = s4 == null ? void 0 : s4.renderBefore) != null ? _b2 : null;
      e4._$litPart$ = h3 = new M(i4.insertBefore(l2(), t4), t4, void 0, s4 != null ? s4 : {});
    }
    return h3._$AI(t3), h3;
  };

  // node_modules/lit-element/lit-element.js
  var s3 = class extends b {
    constructor() {
      super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
    }
    createRenderRoot() {
      var _a6, _b2;
      const t3 = super.createRenderRoot();
      return (_b2 = (_a6 = this.renderOptions).renderBefore) != null ? _b2 : _a6.renderBefore = t3.firstChild, t3;
    }
    update(t3) {
      const i4 = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = j(i4, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      var _a6;
      super.connectedCallback(), (_a6 = this._$Do) == null ? void 0 : _a6.setConnected(true);
    }
    disconnectedCallback() {
      var _a6;
      super.disconnectedCallback(), (_a6 = this._$Do) == null ? void 0 : _a6.setConnected(false);
    }
    render() {
      return w;
    }
  };
  var _a4;
  s3._$litElement$ = true, s3["finalized", "finalized"] = true, (_a4 = globalThis.litElementHydrateSupport) == null ? void 0 : _a4.call(globalThis, { LitElement: s3 });
  var r4 = globalThis.litElementPolyfillSupport;
  r4 == null ? void 0 : r4({ LitElement: s3 });
  var _a5;
  ((_a5 = globalThis.litElementVersions) != null ? _a5 : globalThis.litElementVersions = []).push("4.0.4");

  // htdocs/js/CPUDisplayBit.mjs
  var CPUDisplayBit = class extends s3 {
    static get properties() {
      return {
        bit: { reflect: false, attribute: false }
      };
    }
    constructor() {
      super();
      this.bit = 0;
    }
    // Render the UI as a function of component state
    render() {
      return x`${this.bit == 1 ? "\u{1F534}" : "\u26AA\uFE0F"}`;
    }
  };
  customElements.define("cpu-display-bit", CPUDisplayBit);

  // htdocs/js/CPUDisplay.mjs
  var _CPUDisplay = class _CPUDisplay extends s3 {
    static formatWord(word) {
      return word.toString(16).padStart(4, "0").toUpperCase();
    }
    static formatByte(byte) {
      return byte.toString(16).padStart(2, "0").toUpperCase();
    }
    static get properties() {
      return {
        registers: {
          type: Object,
          reflect: true,
          attribute: true
        }
      };
    }
    constructor() {
      super();
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
      };
      this.initialPc = null;
    }
    step() {
      this.cpu.step();
    }
    start() {
      this.cpu.start();
    }
    stop() {
      this.cpu.stop();
    }
    fastForward() {
      this.cpu.fastForward();
    }
    // Render the UI as a function of component state
    render() {
      if (this.initialPc === null) {
        this.initialPc = this.registers.pc;
      }
      const offset = this.initialPc;
      let memDisplay = [];
      let i4, j2 = 0;
      for (i4 = 0; i4 < 8; i4++) {
        memDisplay.push(x`0x${_CPUDisplay.formatWord(offset + i4 * 8)}: `);
        for (j2 = 0; j2 < 8; j2++) {
          let addr = offset + i4 * 8 + j2;
          if (this.registers.pc == addr) {
            memDisplay.push(x`<span>${_CPUDisplay.formatByte(this.memory._mem[addr])}</span> `);
          } else {
            memDisplay.push(x`${_CPUDisplay.formatByte(this.memory._mem[addr])} `);
          }
        }
        memDisplay.push(x`<br>\n`);
      }
      const stackTop = 511;
      let stackDisplay = [];
      j2 = 0;
      for (i4 = 0; i4 < 8; i4++) {
        stackDisplay.push(x`0x${_CPUDisplay.formatWord(stackTop - (i4 * 8 + j2))}: `);
        for (j2 = 0; j2 < 8; j2++) {
          let addr = stackTop - (i4 * 8 + j2);
          if (this.registers.sp + 256 == addr) {
            stackDisplay.push(x`<span>${_CPUDisplay.formatByte(this.memory._mem[addr])}</span> `);
          } else {
            stackDisplay.push(x`${_CPUDisplay.formatByte(this.memory._mem[addr])} `);
          }
        }
        stackDisplay.push(x`<br>\n`);
      }
      return x`<table>
        <tr>
            <th>PC</th>
            <td>0x${_CPUDisplay.formatWord(this.registers.pc)}</td>
        </tr>
        <tr>
            <th>AC</th>
            <td>0x${_CPUDisplay.formatByte(this.registers.a)}</td>
        </tr>
        <tr>
            <th>X</th>
            <td>0x${_CPUDisplay.formatByte(this.registers.x)}</td>
        </tr>
        <tr>
            <th>Y</th>
            <td>0x${_CPUDisplay.formatByte(this.registers.y)}</td>
        </tr>        
        <tr>
            <th>SP</th>
            <td>0x${_CPUDisplay.formatByte(this.registers.sp)}</td>
        </tr>
        <tr>
            <th>SR</th>
            <td>       
            <table class=flags>
            <tr>
                <th>N</th>
                <th>V</th>
                <th>-</th>
                <th>B</th>
                <th>D</th>
                <th>I</th>
                <th>Z</th>
                <th>C</th>
            </tr>
            <tr>
                <td><cpu-display-bit .bit=${this.registers.sr.n}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.v}></cpu-display-bit></td>
                <td>-</td>
                <td><cpu-display-bit .bit=${this.registers.sr.b}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.d}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.i}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.z}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.registers.sr.c}></cpu-display-bit></td>
            </tr>
        </table>
            </td>
        </tr>
        <tr>
            <th>Cycles</th>
            <td>${this.ticks}</td>
        </tr>        
        <tr>
            <th>c/s</th>
            <td>${this.cps}</td>
        </tr>        
    </table>

    
    <div class=memory>
    ${memDisplay}
    </div>

    <div class=stack>
    ${stackDisplay}
    </div>

    <div class='current-instruction'>${this.cpu.currentInstructionDisplay}</div>

    <div class=buttons>
        <button @click="${this.step}" title='Step' ?disabled=${this.cpu.isRunning}>⏯</button>
        <button @click="${this.start}" title='Start'  ?disabled=${this.cpu.isRunning}>▶️</button>
        <button @click="${this.fastForward}" title='Fast forward' ?disabled=${this.cpu.isRunning}>⏩</button>
        <button @click="${this.stop}" title='Stop' ?disabled=${!this.cpu.isRunning}>⏹</button>
    </div>
`;
    }
  };
  __publicField(_CPUDisplay, "styles", i`
        :root {
            color: var(--fg-color);
            background-color: var(--bg-color);
        }

        table,
        button {
            color: var(--fg-color);
            background-color: var(--bg-color);
            appearance: none;
            font-family: var(--font-family);
        }

        button {
            /* font-family: system-ui, sans-serif; */
            padding: 0;
            border: 0;
            font-size: 400%;
            cursor: pointer;
            margin-right: 0.125em;
            position: relative;
        }

        button:active {
            left: 1px;
            top: 1px;
        }

        button[disabled] {
            opacity: 0.5;
            pointer-events: none;
        }

        .buttons {
            clear: both;
            font-family: sans-serif;
        }

		table {
			background-color: #999;
            margin-bottom: 0.5em;
            margin-right: 2em;
            float: left;
		}

        .active  {
            background-color: #df0808;
            color: white;
        }

		th {
			text-align: right;
		}

		th, 
		td {
			background-color: var(--bg-color);
            color: var(--fg-color);
			padding: 0.5em;
		}

        table.flags th, 
        table.flags td {
            text-align: center;
        }

        textarea {
            width: 30ch;
            font-size: inherit;
            display: none;
        }

        .memory {
            margin-bottom: 1em;

            > span {
                background-color: pink;
            }
        }

        .stack > span {
            background-color: #cfc;
        }

        .current-instruction {
            margin-top: 1em;
        }
	`);
  var CPUDisplay = _CPUDisplay;
  customElements.define("cpu-display", CPUDisplay);

  // htdocs/js/CPUTerminal.mjs
  var _CPUTerminal = class _CPUTerminal extends s3 {
    constructor() {
      super();
      this.hasKey = false;
      this.currentKey = null;
      this.content = [""];
      this.addEventListener("keydown", (e4) => {
        e4.stopPropagation();
        e4.preventDefault();
        const keysToIgnore = ["Shift", "Meta", "Alt", "Control", "ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Tab"];
        if (this.hasKey) {
          return;
        }
        if (keysToIgnore.includes(e4.key)) {
          return false;
        }
        if (e4.key === "Enter") {
          this.currentKey = 10;
        } else if (e4.key === "Escape") {
          this.currentKey = 27;
        } else {
          this.currentKey = e4.key.charCodeAt(0);
        }
        this.hasKey = true;
        console.log("currentKey: ", this.currentKey.toString(16).padStart(2, "0").toUpperCase());
      });
    }
    /**
     * Component's reactive properties
     */
    static get properties() {
      return {
        content: void 0
      };
    }
    firstUpdated() {
      this.terminalDiv = this.renderRoot.querySelector(".terminal");
      this.terminalDiv.focus();
      this.cpu.memory.addPatch({
        start: 53266,
        end: 53266,
        readCallback: this.displayIsReady,
        writeCallback: this.displayCharacter.bind(this)
      });
      this.cpu.memory.addPatch({
        start: 53265,
        end: 53265,
        readCallback: this.keyboardHasKeyToSend.bind(this)
      });
      this.cpu.memory.addPatch({
        start: 53264,
        end: 53264,
        readCallback: this.getKey.bind(this)
      });
    }
    /**
     * Check if we have a key to send
     * 
     * @returns {number} Do we have a key press to send? 
     */
    keyboardHasKeyToSend() {
      if (this.hasKey) {
        return 241;
      } else {
        return 1;
      }
    }
    /**
     * Gets current key and resets hasKey to false
     * 
     * @returns {number} Current key
     */
    getKey() {
      this.hasKey = false;
      return this.currentKey;
    }
    /**
     * Check if display is ready 
     * @returns {number} Is the display ready? Number with bit 6 set? no, Number with bit 6 clear? yes
     */
    displayIsReady() {
      return 1;
    }
    /**
     * Write a character to the display
     * 
     * @param {number} location - not used
     * @param {number} character code
     */
    displayCharacter(location, character) {
      this.content[this.content.length - 1] += String.fromCharCode(character);
      if (this.content[this.content.length - 1].length >= _CPUTerminal.MAX_COLS || character === 10) {
        if (character !== 10) {
          this.content[this.content.length - 1] += "\n";
        }
        this.content.push("");
      }
      if (this.content.length >= _CPUTerminal.MAX_ROWS) {
        this.content.shift();
      }
      this.requestUpdate();
    }
    render() {
      return x`<div class='terminal' tabIndex=0>${this.content}<span class=cursor>@</span></div>`;
    }
  };
  __publicField(_CPUTerminal, "MAX_COLS", 40);
  __publicField(_CPUTerminal, "MAX_ROWS", 24);
  __publicField(_CPUTerminal, "styles", i`
    :root {
        
    }
    
    .terminal {
        word-wrap: break-word;
        white-space: pre;
        /* opacity: 0.5; */
        --padding-block: 2em;
        --padding-inline: 2ch;
        padding: var(--padding-block) var(--padding-inline);
        font-size: 14px;
        line-height: 1.5;
        position: relative;
        font-family: var(--font-family, monospace);
        font-weight: normal;
        // text-transform: uppercase;
        background-color: var(--bg-color, #333);
        color: var(--fg-color, white);
        width: 40ch;
        height: calc(31em + var(--padding-block) + var(--padding-block));
        overflow: hidden;        
    }

    .terminal:focus-visible,
    .terminal:focus {
        /* opacity: 1; */
        /* outline: none; */
    }

    .terminal span.cursor { 
        animation: blink 0.75s infinite;
    }


    @keyframes blink {
        0% {
            opacity: 0;
        }

        49% {
            opacity: 0;
        }

        50% {
            opacity: 1;
        }
    }

    @keyframes flicker {
        0% {
        opacity: 0.27861;
        }
        5% {
        opacity: 0.34769;
        }
        10% {
        opacity: 0.23604;
        }
        15% {
        opacity: 0.90626;
        }
        20% {
        opacity: 0.18128;
        }
        25% {
        opacity: 0.83891;
        }
        30% {
        opacity: 0.65583;
        }
        35% {
        opacity: 0.67807;
        }
        40% {
        opacity: 0.26559;
        }
        45% {
        opacity: 0.84693;
        }
        50% {
        opacity: 0.96019;
        }
        55% {
        opacity: 0.08594;
        }
        60% {
        opacity: 0.20313;
        }
        65% {
        opacity: 0.71988;
        }
        70% {
        opacity: 0.53455;
        }
        75% {
        opacity: 0.37288;
        }
        80% {
        opacity: 0.71428;
        }
        85% {
        opacity: 0.70419;
        }
        90% {
        opacity: 0.7003;
        }
        95% {
        opacity: 0.36108;
        }
        100% {
        opacity: 0.24387;
        }
    }
    @keyframes textShadow {
        0% {
        text-shadow: 0.4389924193300864px 0 1px rgba(0,30,255,0.5), -0.4389924193300864px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        5% {
        text-shadow: 2.7928974010788217px 0 1px rgba(0,30,255,0.5), -2.7928974010788217px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        10% {
        text-shadow: 0.02956275843481219px 0 1px rgba(0,30,255,0.5), -0.02956275843481219px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        15% {
        text-shadow: 0.40218538552878136px 0 1px rgba(0,30,255,0.5), -0.40218538552878136px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        20% {
        text-shadow: 3.4794037899852017px 0 1px rgba(0,30,255,0.5), -3.4794037899852017px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        25% {
        text-shadow: 1.6125630401149584px 0 1px rgba(0,30,255,0.5), -1.6125630401149584px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        30% {
        text-shadow: 0.7015590085143956px 0 1px rgba(0,30,255,0.5), -0.7015590085143956px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        35% {
        text-shadow: 3.896914047650351px 0 1px rgba(0,30,255,0.5), -3.896914047650351px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        40% {
        text-shadow: 3.870905614848819px 0 1px rgba(0,30,255,0.5), -3.870905614848819px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        45% {
        text-shadow: 2.231056963361899px 0 1px rgba(0,30,255,0.5), -2.231056963361899px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        50% {
        text-shadow: 0.08084290417898504px 0 1px rgba(0,30,255,0.5), -0.08084290417898504px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        55% {
        text-shadow: 2.3758461067427543px 0 1px rgba(0,30,255,0.5), -2.3758461067427543px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        60% {
        text-shadow: 2.202193051050636px 0 1px rgba(0,30,255,0.5), -2.202193051050636px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        65% {
        text-shadow: 2.8638780614874975px 0 1px rgba(0,30,255,0.5), -2.8638780614874975px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        70% {
        text-shadow: 0.48874025155497314px 0 1px rgba(0,30,255,0.5), -0.48874025155497314px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        75% {
        text-shadow: 1.8948491305757957px 0 1px rgba(0,30,255,0.5), -1.8948491305757957px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        80% {
        text-shadow: 0.0833037308038857px 0 1px rgba(0,30,255,0.5), -0.0833037308038857px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        85% {
        text-shadow: 0.09769827255241735px 0 1px rgba(0,30,255,0.5), -0.09769827255241735px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        90% {
        text-shadow: 3.443339761481782px 0 1px rgba(0,30,255,0.5), -3.443339761481782px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        95% {
        text-shadow: 2.1841838852799786px 0 1px rgba(0,30,255,0.5), -2.1841838852799786px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        100% {
        text-shadow: 2.6208764473832513px 0 1px rgba(0,30,255,0.5), -2.6208764473832513px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
    }

    .Xterminal::after {
        content: " ";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: rgba(18, 16, 16, 0.1);
        opacity: 0;
        z-index: 2;
        pointer-events: none;
        animation: flicker 0.5s infinite;
    }

    .terminal::after {
        content: '';
        background: transparent top left no-repeat url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/86186/crt.png);
        background-size: 100% 100%;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        pointer-events: none;
    }

    .terminal::before {
        content: " ";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        z-index: 2;
        background-size: 100% 2px, 3px 100%;
        pointer-events: none;
    }
    .terminal {
        animation: textShadow 1.6s infinite;
    }
    
    `);
  var CPUTerminal = _CPUTerminal;
  customElements.define("cpu-terminal", CPUTerminal);

  // htdocs/js/CPU.mjs
  var _CPU = class _CPU {
    static dec2hexByte(dec) {
      return dec.toString(16).padStart(2, "0").toUpperCase();
    }
    static dec2hexWord(dec) {
      return dec.toString(16).padStart(4, "0").toUpperCase();
    }
    constructor(options) {
      this.initRegisters();
      this.initMemory();
      this.initZeroTimeoutQueue();
      this.isRunning = false;
      this.isFastForwarding = false;
      this.tickCount = 0;
      this.subCycleInstructions = [];
      this.display = void 0;
      if (options && options.displayContainer) {
        this.display = document.createElement("cpu-display");
        this.display.cpu = this;
        this.display.memory = this.memory;
        options.displayContainer.append(this.display);
      }
      if (options && options.terminalContainer) {
        this.terminal = document.createElement("cpu-terminal");
        this.terminal.cpu = this;
        options.terminalContainer.append(this.terminal);
      }
      return this;
    }
    doTick() {
      this.tickCount++;
      this.processTick();
      if (this.isFastForwarding) {
        for (let i4 = 0; i4 < _CPU.FAST_FORWARD_CYCLE_BATCH_SIZE; i4++) {
          this.tickCount++;
          this.processTick();
        }
        this.newZeroTimeout(this.doTick.bind(this));
      } else {
        this.updateDisplay();
        if (this.isRunning) {
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
        sp: 255,
        sr: {
          n: 0,
          v: 0,
          b: 1,
          d: 0,
          i: 0,
          z: 0,
          c: 0
        }
      };
    }
    initMemory() {
      this.memory = new Memory();
    }
    /**
     * Do something in response to a clock tick
     */
    processTick() {
      if (this.subCycleInstructions.length) {
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
      let instruction, mode, pc = this.registers.pc;
      const opcode = this.memory.readByte(pc);
      [instruction, mode] = InstructionDecoder.decodeOpcode(opcode);
      this.currentInstructionDisplay = `Instruction: pc: ${_CPU.dec2hexByte(pc)}, opcode: ${_CPU.dec2hexByte(opcode)}, ${instruction}, mode: ${mode}`;
      switch (instruction) {
        case "ADC":
          (() => {
            let operand = {};
            let value;
            if (mode !== "#") {
              this.getOperand(mode, operand);
            }
            this.queueStep(() => {
              let sum;
              if (mode === "#") {
                this.getOperand(mode, operand);
                value = operand.value;
              } else {
                value = this.memory.readByte(operand.value);
              }
              console.log(`value: ${_CPU.dec2hexByte(operand.value)}, mode: ${mode}`);
              if ((this.registers.a ^ value) & 128) {
                this.registers.sr.v = 0;
              } else {
                this.registers.sr.v = 1;
              }
              if (this.registers.sr.d) {
                sum = (this.registers.a & 15) + (value & 15) + this.registers.sr.c;
                if (sum >= 10) {
                  sum = 16 | sum + 6 & 15;
                }
                sum += (this.registers.a & 240) + (value & 240);
                if (sum >= 160) {
                  this.registers.sr.c = 1;
                  if (this.registers.sr.v && sum >= 384) {
                    this.registers.sr.v = 0;
                  }
                  sum += 96;
                } else {
                  this.registers.sr.c = 0;
                  if (this.registers.sr.v && sum < 128) {
                    this.registers.sr.v = 0;
                  }
                }
              } else {
                sum = this.registers.a + value + this.registers.sr.c;
                if (sum >= 256) {
                  this.registers.sr.c = 1;
                  if (this.registers.sr.v && sum >= 384) {
                    this.registers.sr.v = 0;
                  }
                } else {
                  this.registers.sr.c = 0;
                  if (this.registers.sr.v && sum < 128) {
                    this.registers.sr.v = 0;
                  }
                }
              }
              this.registers.a = sum & 255;
              this.updateFlags(this.registers.a);
            });
          })();
          break;
        case "AND":
          (() => {
            let operand = {};
            let value;
            if (mode !== "#") {
              this.getOperand(mode, operand);
            }
            this.queueStep(() => {
              if (mode === "#") {
                this.getOperand(mode, operand);
                value = operand.value;
              } else {
                value = this.memory.readByte(operand.value);
              }
            });
            this.queueStep(() => {
              console.log(`AND a = ${_CPU.dec2hexByte(this.registers.a)}, value = ${_CPU.dec2hexByte(value)}`);
              this.registers.a = this.registers.a & value;
              this.updateFlags(this.registers.a);
            });
          })();
          break;
        case "ASL":
          (() => {
            let operand = {};
            let value;
            this.getOperand(mode, operand);
            if (mode === "A") {
              this.queueStep(() => {
                this.registers.sr.c = this.registers.a >= 128 ? 1 : 0;
                this.registers.a = this.registers.a << 1 & 255;
                this.updateFlags(this.registers.a);
              });
            } else {
              this.queueStep(() => {
                value = this.memory.readByte(operand.value);
              });
              this.queueStep(() => {
                this.registers.sr.c = value >= 128 ? 1 : 0;
                value = value << 1 & 255;
                this.memory.writeByte(operand.value, value);
                this.updateFlags(value);
              });
            }
          })();
          break;
        case "BCC":
          (() => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              if (this.registers.sr.c === 1) {
                return;
              }
              this.doBranch(operand.value);
            });
          })();
          break;
        case "BCS":
          (() => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              if (this.registers.sr.c === 0) {
                return;
              }
              this.doBranch(operand.value);
            });
          })();
          break;
        case "BEQ":
          (() => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              if (this.registers.sr.z === 0) {
                return;
              }
              this.doBranch(operand.value);
            });
          })();
          break;
        case "BIT":
          (() => {
            let operand = {};
            let value;
            this.getOperand(mode, operand);
            this.queueStep(() => {
              value = this.memory.readByte(operand.value);
              this.registers.sr.n = (value & 128) > 0 ? 1 : 0;
              this.registers.sr.v = (value & 64) > 0 ? 1 : 0;
              if (value & this.registers.a !== 0) {
                this.registers.sr.z = 0;
              } else {
                this.registers.sr.z = 1;
              }
            });
          })();
          break;
        case "BMI":
          (() => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              if (this.registers.sr.n === 0) {
                return;
              }
              this.doBranch(operand.value);
            });
          })();
          break;
        case "BNE":
          (() => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              if (this.registers.sr.z === 1) {
                return;
              }
              this.doBranch(operand.value);
            });
          })();
          break;
        case "BPL":
          (() => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              if (this.registers.sr.n === 1) {
                return;
              }
              this.doBranch(operand.value);
            });
          })();
          break;
        case "BRK":
          this.stop();
          break;
        case "BVC":
          () => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              if (this.registers.sr.v === 1) {
                return;
              }
              this.doBranch(operand.value);
            });
          };
          break;
        case "BVS":
          () => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              if (this.registers.sr.v === 0) {
                return;
              }
              this.doBranch(operand.value);
            });
          };
          break;
        case "CLC":
          this.queueStep(() => {
            this.registers.sr.c = 0;
          });
          break;
        case "CLD":
          this.queueStep(() => {
            this.registers.sr.d = 0;
          });
          break;
        case "CLI":
          this.queueStep(() => {
            this.registers.sr.i = 0;
          });
          break;
        case "CLV":
          this.queueStep(() => {
            this.registers.sr.v = 0;
          });
          break;
        case "CMP":
          this.compareRegister("a", mode);
          break;
        case "CPX":
          this.compareRegister("x", mode);
          break;
        case "CPY":
          this.compareRegister("y", mode);
          break;
        case "DEC":
          (() => {
            let operand = {}, currentValue;
            this.getOperand(mode, operand);
            this.queueStep(() => {
              currentValue = this.memory.readByte(operand.value);
            });
            this.queueStep(() => {
              currentValue = currentValue - 1;
              if (currentValue === -1) {
                currentValue = 255;
              }
              this.memory.writeByte(operand.value, currentValue);
              this.updateFlags(currentValue);
            });
          })();
          break;
        case "DEX":
          this.queueStep(() => {
            this.registers.x = this.registers.x - 1 & 255;
            this.updateFlags(this.registers.x);
          });
          break;
        case "DEY":
          this.queueStep(() => {
            this.registers.y = this.registers.y - 1 & 255;
            this.updateFlags(this.registers.y);
          });
          break;
        case "EOR":
          (() => {
            let operand = {}, value;
            if (mode !== "#") {
              this.getOperand(mode, operand);
            }
            this.queueStep(() => {
              if (mode === "#") {
                this.getOperand(mode, operand);
                value = operand.value;
              } else {
                value = this.memory.readByte(operand.value);
              }
              this.registers.a = this.registers.a ^ value;
              this.updateFlags(this.registers.a);
            });
          })();
          break;
        case "INC":
          (() => {
            let operand = {}, currentValue;
            this.getOperand(mode, operand);
            this.queueStep(() => {
              currentValue = this.memory.readByte(operand.value);
            });
            this.queueStep(() => {
              currentValue = currentValue + 1 & 255;
              this.memory.writeByte(operand.value, currentValue);
              this.updateFlags(currentValue);
            });
          })();
          break;
        case "INX":
          this.queueStep(() => {
            this.registers.x = this.registers.x + 1 & 255;
            this.updateFlags(this.registers.x);
          });
          break;
        case "INY":
          this.queueStep(() => {
            this.registers.y = this.registers.y + 1 & 255;
            this.updateFlags(this.registers.y);
          });
          break;
        case "JMP":
          (() => {
            let operand = {};
            this.getOperand(mode, operand);
            this.queueStep(() => {
              this.registers.pc = operand.value;
            });
          })();
          break;
        case "JSR":
          (() => {
            let returnAddress, highByte, lowByte;
            this.queueStep(() => {
              lowByte = this.popByte();
            });
            this.queueStep(() => {
              highByte = this.popByte();
            });
            this.queueStep(() => {
              returnAddress = this.registers.pc - 1;
              this.pushToStack(returnAddress >> 8);
            });
            this.queueStep(() => {
              this.pushToStack(returnAddress & 255);
            });
            this.queueStep(() => {
              this.registers.pc = lowByte + (highByte << 8);
            });
          })();
          break;
        case "LDA":
          this.loadRegister("a", mode);
          break;
        case "LDX":
          this.loadRegister("x", mode);
          break;
        case "LDY":
          this.loadRegister("y", mode);
          break;
        case "LSR":
          (() => {
            let operand = {};
            let input;
            this.getOperand(mode, operand);
            if (mode === "A") {
              this.queueStep(() => {
                this.registers.sr.c = this.registers.a & 1 ? 1 : 0;
                this.registers.a = this.registers.a >> 1;
                this.updateFlags(this.registers.a);
              });
            } else {
              this.queueStep(() => {
                input = this.memory.readByte(operand.value);
              });
              this.queueStep(() => {
                this.registers.sr.c = input & 1 ? 1 : 0;
                input = input >> 1;
                this.memory.writeByte(operand.value, input);
                this.updateFlags(input);
              });
            }
          })();
        case "NOP":
          this.queueStep(() => {
          });
          break;
        case "ORA":
          (() => {
            let operand = {}, value;
            if (mode !== "#") {
              this.getOperand(mode, operand);
            }
            this.queueStep(() => {
              if (mode === "#") {
                this.getOperand(mode, operand);
                value = operand.value;
              } else {
                value = this.memory.readByte(operand.value);
              }
            });
            this.queueStep(() => {
              this.registers.a = this.registers.a | value;
              this.updateFlags(this.registers.a);
            });
          })();
          break;
        case "PHA":
          this.queueStep(() => {
          });
          this.queueStep(() => {
            this.pushToStack(this.registers.a);
          });
          break;
        case "PHP":
          this.queueStep(() => {
          });
          this.queueStep(() => {
            let flagsByte = this.flagsToByte();
            flagsByte = flagsByte | 16;
            this.pushToStack(flagsByte);
          });
          break;
        case "PLA":
          this.queueStep(() => {
          });
          this.queueStep(() => {
            this.registers.a = this.pullFromStack();
          });
          break;
        case "PLP":
          this.queueStep(() => {
          });
          this.queueStep(() => {
            const currentBreak = this.registers.sr.b;
            let flagsByte = this.pullFromStack();
            this.byteToFlags(flagsByte);
            this.registers.sr.b = currentBreak;
          });
          break;
        case "ROL":
          (() => {
            let operand = {};
            let input;
            this.getOperand(mode, operand);
            if (mode === "A") {
              this.queueStep(() => {
                input = this.registers.a;
                const saveCarry = this.registers.sr.c;
                this.registers.sr.c = input & 1 << 6 ? 1 : 0;
                input = input << 1 & 255;
                input |= saveCarry;
                this.registers.a = input;
                this.updateFlags(this.registers.a);
              });
            } else {
              this.queueStep(() => {
                input = this.memory.readByte(operand.value);
              });
              this.queueStep(() => {
                const saveCarry = this.registers.sr.c;
                this.registers.sr.c = input & 1 << 7 ? 1 : 0;
                input = input << 1 & 255;
                input |= saveCarry;
                this.memory.writeByte(operand.value, input);
                this.updateFlags(input);
              });
            }
          })();
          break;
        case "ROR":
          (() => {
            let operand = {};
            let input;
            this.getOperand(mode, operand);
            if (mode === "A") {
              this.queueStep(() => {
                input = this.registers.a;
                const saveCarry = this.registers.sr.c;
                this.registers.sr.c = input & 1 << 0 ? 1 : 0;
                input = input >> 1;
                if (saveCarry) {
                  input |= 128;
                }
                this.registers.a = input;
                this.updateFlags(this.registers.a);
              });
            } else {
              this.queueStep(() => {
                input = this.memory.readByte(operand.value);
              });
              this.queueStep(() => {
                const saveCarry = this.registers.sr.c;
                this.registers.sr.c = input & 1 << 0 ? 1 : 0;
                input = input >> 1;
                if (saveCarry) {
                  input |= 128;
                }
                this.memory.writeByte(operand.value, input);
                this.updateFlags(input);
              });
            }
          })();
          break;
        case "RTI":
          (() => {
            let flagsByte, returnAddressLowByte, returnAddressHighByte;
            this.queueStep(() => {
              flagsByte = this.pullFromStack();
            });
            this.queueStep(() => {
              returnAddressLowByte = this.pullFromStack();
            });
            this.queueStep(() => {
              returnAddressHighByte = this.pullFromStack();
            });
            this.queueStep(() => {
            });
            this.queueStep(() => {
              const currentBreak = this.registers.sr.b;
              this.byteToFlags(flagsByte);
              this.registers.sr.b = currentBreak;
              this.registers.pc = returnAddressLowByte + (returnAddressHighByte << 8) + 1;
            });
          })();
          break;
        case "RTS":
          (() => {
            let returnAddressLowByte, returnAddressHighByte;
            this.queueStep(() => {
              returnAddressLowByte = this.pullFromStack();
            });
            this.queueStep(() => {
              returnAddressHighByte = this.pullFromStack();
            });
            this.queueStep(() => {
            });
            this.queueStep(() => {
            });
            this.queueStep(() => {
              this.registers.pc = returnAddressLowByte + (returnAddressHighByte << 8) + 1;
            });
          })();
          break;
        case "SBC":
          (() => {
            let operand = {};
            let value;
            if (mode !== "#") {
              this.getOperand(mode, operand);
            }
            this.queueStep(() => {
              let result, temp;
              if (mode === "#") {
                this.getOperand(mode, operand);
                value = operand.value;
              } else {
                value = this.memory.readByte(operand.value);
              }
              if ((this.registers.a ^ value) & 128) {
                this.registers.sr.v = 1;
              } else {
                this.registers.sr.v = 0;
              }
              if (this.registers.sr.d) {
                temp = 15 + (this.registers.a & 15) - (value & 15) + this.registers.sr.c;
                if (temp < 16) {
                  result = 0;
                  temp -= 6;
                } else {
                  result = 16;
                  temp -= 16;
                }
                result += 240 + (this.registers.a & 240) - (value & 240);
                if (result < 256) {
                  this.registers.sr.c = 0;
                  if (this.registers.sr.v && result < 128) {
                    this.registers.sr.v = 0;
                  }
                  result -= 96;
                } else {
                  this.registers.sr.c = 1;
                  if (this.registers.sr.v && result >= 384) {
                    this.registers.sr.v = 0;
                  }
                }
                result += temp;
              } else {
                result = 255 + this.registers.a - value + this.registers.sr.c;
                if (result < 256) {
                  this.registers.sr.c = 0;
                  if (this.registers.sr.v && result < 128) {
                    this.registers.sr.v = 0;
                  }
                } else {
                  this.registers.sr.c = 1;
                  if (this.registers.sr.v && result >= 384) {
                    this.registers.sr.v = 0;
                  }
                }
              }
              this.registers.a = result & 255;
              this.updateFlags(this.registers.a);
            });
          })();
          break;
        case "SEC":
          this.queueStep(() => {
            this.registers.sr.c = 1;
          });
          break;
        case "SED":
          this.queueStep(() => {
            this.registers.sr.d = 1;
          });
          break;
        case "SEI":
          this.queueStep(() => {
            this.registers.sr.i = 1;
          });
          break;
        case "STA":
          this.storeRegister("a", mode);
          break;
        case "STX":
          this.storeRegister("x", mode);
          break;
        case "STY":
          this.storeRegister("y", mode);
          break;
        case "TAX":
          this.queueStep(() => {
            this.registers.x = this.registers.a;
            this.updateFlags(this.registers.x);
          });
          break;
        case "TAY":
          this.queueStep(() => {
            this.registers.y = this.registers.a;
            this.updateFlags(this.registers.y);
          });
          break;
        case "TSX":
          this.queueStep(() => {
            this.registers.x = this.registers.sp;
            this.updateFlags(this.registers.x);
          });
          break;
        case "TXA":
          this.queueStep(() => {
            this.registers.a = this.registers.x;
            this.updateFlags(this.registers.a);
          });
          break;
        case "TXS":
          this.queueStep(() => {
            this.registers.sp = this.registers.x;
          });
          break;
        case "TYA":
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
      if (offset > 127) {
        newAddr = this.registers.pc - (256 - offset);
      } else {
        newAddr = this.registers.pc + offset;
      }
      this.registers.pc = newAddr;
    }
    /**
     * Convert status flags to a byte
     * @returns int byte;
     */
    flagsToByte() {
      let byte = 0;
      if (this.registers.sr.c === 1) {
        byte += 1;
      }
      if (this.registers.sr.z === 1) {
        byte += 2;
      }
      if (this.registers.sr.i === 1) {
        byte += 4;
      }
      if (this.registers.sr.d === 1) {
        byte += 8;
      }
      if (this.registers.sr.b === 1) {
        byte += 16;
      }
      if (1) {
        byte += 32;
      }
      if (this.registers.sr.v === 1) {
        byte += 64;
      }
      if (this.registers.sr.n === 1) {
        byte += 128;
      }
      return byte;
    }
    /**
     * Decodes byte to status flags and sets the flags
     * @param {*} byte 
     */
    byteToFlags(byte) {
      this.registers.sr.n = byte & 128 ? 1 : 0;
      this.registers.sr.v = byte & 64 ? 1 : 0;
      this.registers.sr.b = byte & 16 ? 1 : 0;
      this.registers.sr.d = byte & 8 ? 1 : 0;
      this.registers.sr.i = byte & 4 ? 1 : 0;
      this.registers.sr.z = byte & 2 ? 1 : 0;
      this.registers.sr.c = byte & 1 ? 1 : 0;
    }
    /**
     * Push a value onto the stack, and adjust the stack pointer
     * @param {byte} value 
     */
    pushToStack(value) {
      this.memory.writeByte(this.registers.sp + 256, value);
      this.registers.sp--;
      if (this.registers.sp < 0) {
        console.error("Stack has overflowed! Wrapping...");
        this.registers.sp = this.registers.sp & 255;
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
      if (this.registers.sp >= 256) {
        console.error("Stack has underflowed! Wrapping...");
        this.registers.sp = this.registers.sp & 255;
      }
      value = this.memory.readByte(this.registers.sp + 256);
      return value;
    }
    /**
     * Compare a register to memory
     * 
     * @param {char} reg 
     * @param {String} mode 
     */
    compareRegister(reg, mode) {
      let operand = {};
      if (mode !== "#") {
        this.getOperand(mode, operand);
      }
      this.queueStep(() => {
        let value;
        if (mode === "#") {
          this.getOperand(mode, operand);
          value = operand.value;
        } else {
          value = this.memory.readByte(operand.value);
        }
        let result = this.registers[reg] - value;
        if (result < 0) {
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
      if (mode === "#") {
        this.queueStep(() => {
          this.getOperand(mode, operand);
          this.registers[reg] = operand.value;
          this.updateFlags(this.registers[reg]);
        });
      } else {
        this.getOperand(mode, operand);
        this.queueStep(() => {
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
      let operand = {};
      this.getOperand(mode, operand);
      this.queueStep(() => {
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
      switch (mode) {
        case "#":
          operand.value = this.popByte();
          break;
        case "A":
          operand.value = null;
          break;
        case "REL":
          this.queueStep(() => {
            operand.value = this.popByte();
          });
          break;
        case "ABS":
          (() => {
            let lowByte, highByte;
            this.queueStep(() => {
              lowByte = this.popByte();
            });
            this.queueStep(() => {
              highByte = this.popByte();
              const addr = lowByte + (highByte << 8);
              operand.value = addr;
            });
          })();
          break;
        case "ABSX":
          (() => {
            let lowByte, highByte;
            this.queueStep(() => {
              lowByte = this.popByte();
            });
            this.queueStep(() => {
              highByte = this.popByte();
              const addr = lowByte + (highByte << 8) + this.registers.x;
              operand.value = addr;
            });
          })();
          break;
        case "ABSY":
          (() => {
            let lowByte, highByte;
            this.queueStep(() => {
              lowByte = this.popByte();
            });
            this.queueStep(() => {
              highByte = this.popByte();
              const addr = lowByte + (highByte << 8) + this.registers.y;
              operand.value = addr;
            });
          })();
          break;
        case "IND":
          (() => {
            let lowByteSrc, highByteSrc, srcAddr;
            let lowByte, highByte;
            this.queueStep(() => {
              lowByteSrc = this.popByte();
            });
            this.queueStep(() => {
              highByteSrc = this.popByte();
              srcAddr = lowByteSrc + (highByteSrc << 8);
            });
            this.queueStep(() => {
              lowByte = this.memory.readByte(srcAddr);
            });
            this.queueStep(() => {
              highByte = this.memory.readByte(srcAddr + 1);
              operand.value = lowByte + (highByte << 8);
            });
          })();
          break;
        case "INDY":
          (() => {
            let zeroAddrSrc, srcLowByte, srcHighByte, srcAddr;
            let lowByte, highByte;
            this.queueStep(() => {
              zeroAddrSrc = this.popByte();
            });
            this.queueStep(() => {
              srcLowByte = this.memory.readByte(zeroAddrSrc);
            });
            this.queueStep(() => {
              srcHighByte = this.memory.readByte(zeroAddrSrc + 1 & 255);
              srcAddr = srcLowByte + (srcHighByte << 8) + this.registers.y;
              operand.value = srcAddr;
            });
          })();
          break;
        case "ZPG":
          (() => {
            let lowByte;
            this.queueStep(() => {
              lowByte = this.popByte();
              const addr = lowByte;
              operand.value = addr;
            });
          })();
          break;
        case "ZPGX":
          (() => {
            let lowByte;
            this.queueStep(() => {
              lowByte = this.popByte();
            });
            this.queueStep(() => {
              const addr = lowByte + this.registers.x & 255;
              operand.value = addr;
            });
          })();
          break;
        case "XIND":
          (() => {
            let zeroAddrSrc, srcAddr;
            let lowByte, highByte;
            this.queueStep(() => {
              zeroAddrSrc = this.popByte();
            });
            this.queueStep(() => {
              srcAddr = zeroAddrSrc + this.registers.x & 255;
            });
            this.queueStep(() => {
              lowByte = this.memory.readByte(srcAddr);
            });
            this.queueStep(() => {
              highByte = this.memory.readByte(srcAddr + 1);
              const finalAddress = lowByte + (highByte << 8);
              console.log(`XIND finalAddress: ${_CPU.dec2hexWord(finalAddress)}`);
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
      if (result == 0) {
        this.registers.sr.z = 1;
      } else {
        this.registers.sr.z = 0;
      }
      if (!!(result & 1 << 7)) {
        this.registers.sr.n = 1;
      } else {
        this.registers.sr.n = 0;
      }
    }
    step() {
      if (this.isRunning) {
        return;
      }
      this.doTick();
      this.updateDisplay();
      if (this.display) {
        this.display.cps = "";
      }
    }
    steps(n4) {
      for (let i4 = 0; i4 < n4; i4++) {
        this.doTick();
      }
      this.updateDisplay();
    }
    start() {
      if (this.isRunning) {
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
      if (typeof window !== "undefined") {
        window.addEventListener("message", (event) => {
          if (event.source == window && event.data == "zeroTimeoutPushed") {
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
      this.timeoutsQueue.push(fn);
      if (typeof window !== "undefined") {
        window.postMessage("zeroTimeoutPushed", "*");
      } else {
        setTimeout(fn, 0);
      }
    }
    /**
     * Update the display of the CPU (if there is one attached)
     */
    updateDisplay() {
      if (this.display) {
        const registers = __spreadValues({}, this.registers);
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
      const timeTaken = (performance.now() - this.startTime) / 1e3;
      const ticksProcessed = this.tickCount - this.startTicks;
      if (this.display) {
        this.display.cps = Math.round(ticksProcessed / timeTaken);
      }
      this.updateDisplay();
    }
    stopProfiling() {
      clearInterval(this.profileUpdateIntervalTimer);
    }
  };
  __publicField(_CPU, "FAST_FORWARD_CYCLE_BATCH_SIZE", 9973);
  var CPU = _CPU;

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
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=scripts-dist.js.map
