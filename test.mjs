import { CPU } from './htdocs/js/CPU.mjs';

let cpu = new CPU;
let i;

function assert(test) {
    if(!test) {
        console.log('Test failed!');
        console.trace();
        dumpCpu();
    }
}

function assertEquals(test, result) {
    if(test !== result) {
        console.log(`test '${dec2hexWord(test)}' !== result: '${dec2hexWord(result)}'`);
        console.trace();
        dumpCpu();
    }
}

function dumpCpu() {
    console.log(`PC : ${dec2hexWord(cpu.registers.pc)}`);
    console.log(`a : ${dec2hexByte(cpu.registers.a)}`);
    console.log(`x : ${dec2hexByte(cpu.registers.x)}`);
    console.log(`y : ${dec2hexByte(cpu.registers.y)}`);
    console.log(`sr.n : ${cpu.registers.sr.n}`);
    console.log(`sr.v : ${cpu.registers.sr.v}`);
    console.log(`sr.z : ${cpu.registers.sr.z}`);
    console.log(`sr.c : ${cpu.registers.sr.c}`);
    // console.log(`acc : ${dec2hexWord(cpu.registers.acc)}`);
}    

function dec2hexWord(dec) {
    return dec.toString(16).padStart(4, '0').toUpperCase();
}

function dec2hexByte(dec) {
    return dec.toString(16).padStart(2, '0').toUpperCase();
}

// ADC %
cpu.memory.hexLoad(0x00, '69 69 69 01');
cpu.steps(6);

assert(cpu.registers.a == 0x6A);
assert(cpu.registers.sr.n == 0);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, '69 69 69 69');
cpu.steps(4);
assert(cpu.registers.a == 0xD2);
assert(cpu.registers.sr.n == 1);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, '69 69 69 97');
cpu.steps(4);
assert(cpu.registers.a == 0x00);
assert(cpu.registers.sr.n == 0);
assert(cpu.registers.sr.z == 1);
assert(cpu.registers.sr.c == 1);

// 0x18 CLC -- Clear carry flag
cpu = new CPU;
cpu.registers.sr.c = 1;
assert(cpu.registers.sr.c == 1);
cpu.memory.hexLoad(0x00, '18');
cpu.steps(2);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, 'A9 69'); // LDA immediate
cpu.steps(2);
assert(cpu.registers.a == 0x69);
assert(cpu.registers.sr.n == 0);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, 'A9 FA'); // LDA immediate
cpu.steps(4);
assert(cpu.registers.a == 0xFA);
assert(cpu.registers.sr.n == 1);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, 'A9 69 A9 00'); // LDA immediate
cpu.steps(4);
assert(cpu.registers.a == 0x00);
assert(cpu.registers.sr.n == 0);
assert(cpu.registers.sr.z == 1);
assert(cpu.registers.sr.c == 0);

// 0x4C: // JMP, 3 cycles
cpu = new CPU;
// console.log(cpu.registers.pc);
cpu.memory.hexLoad(0x00, '4C EF BE');
cpu.steps(4);
assert(cpu.registers.pc == 0xBEEF);


console.log('Indirect: ($c000)');
cpu = new CPU;
cpu.memory.hexLoad(0x00, 'a9 01 85 f0 a9 cc 85 f1 6c f0 00');
cpu.steps(17);
assert(cpu.registers.a == 0xCC);
assert(cpu.registers.x == 0x00);
assert(cpu.registers.y == 0x00);
assert(cpu.registers.pc == 0xCC02);
assert(cpu.registers.sr.n == 1);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);


// Indexed indirect: ($c0,X)
cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'a2 01 a9 05 85 01 a9 07 85 02 a0 0a 8c 05 07 a1 00');
cpu.registers.pc = 0x0600;
cpu.steps(25);
assert(cpu.registers.a == 0x0A);
assert(cpu.registers.x == 0x01);
assert(cpu.registers.y == 0x0A);

// Indirect indexed: ($c0),Y
cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'a0 01 a9 03 85 01 a9 07 85 02 a2 0a 8e 04 07 b1 01');
cpu.registers.pc = 0x0600;
cpu.steps(25);
assert(cpu.registers.a == 0x0A);
assert(cpu.registers.x == 0x0A);
assert(cpu.registers.y == 0x01);

console.log('Test LDA');
cpu = new CPU;
cpu.memory.writeByte(0x00EF, 0x37);
cpu.memory.writeByte(0x00DF, 0x73);
cpu.memory.writeByte(0x00CF, 0x42);

// Set up address for IND,Y test
cpu.memory.writeByte(0x00B0, 0x01); // Low byte 01
cpu.memory.writeByte(0x00B1, 0x02); // High byte 02, thus 0201, will add 2 from Y
cpu.memory.writeByte(0x0203, 0x96); // Put 96 in 0203

// Set up memory for XIND test
cpu.memory.writeByte(0x00C4, 0x44); // Low byte in zero page
cpu.memory.writeByte(0x00C5, 0x00); // High byte in zero page
cpu.memory.writeByte(0x0044, 0x21); // Value we're going to add to A

cpu.memory.hexLoad(0x0600, 'A9 69 AD EF 00 A5 DF A0 01 B9 CE 00 A0 02 B1 B0 A2 04 61 C0');
cpu.registers.pc = 0x0600;
// Test immediate
cpu.steps(2);
assertEquals(cpu.registers.a, 0x69);

// Test absolute
cpu.steps(4);
assertEquals(cpu.registers.a, 0x37);

// Test zero page
cpu.steps(3);
assertEquals(cpu.registers.a, 0x73);

// Test ABS,Y
cpu.steps(2); // LDY # 01
cpu.steps(4); // LDA CF+Y
assertEquals(cpu.registers.a, 0x42);

// Test INDY - The zero page address is dereferenced, and the Y register is added to the resulting address
cpu.steps(2); // LDY # 02
cpu.steps(5);
assertEquals(cpu.registers.a, 0x96);

// Text XIND
cpu.steps(2); // LDX # 04
cpu.steps(6) // ADC XIND
assertEquals(cpu.registers.a, 0xB7);

// Zero page, X addressing mode
cpu = new CPU;
cpu.registers.x = 0x05;
cpu.memory.hexLoad(0x0600, 'B5 05');
cpu.memory.writeByte(0x000A, 0x69); 
cpu.registers.pc = 0x0600;
cpu.steps(4);
assertEquals(cpu.registers.a, 0x69);

// Test x overflow on increment
cpu = new CPU;
cpu.registers.x = 0xFF;
cpu.memory.hexLoad(0x0000, 'E8');
cpu.steps(2);
assertEquals(cpu.registers.x, 0x00);
assertEquals(cpu.registers.sr.c, 0);
assertEquals(cpu.registers.sr.z, 1);


// Test x underflow on increment
cpu = new CPU;
cpu.registers.x = 0x00;
cpu.memory.hexLoad(0x0000, 'CA');
cpu.steps(2);
assertEquals(cpu.registers.x, 0xFF);

// PHA PLA 
cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'a2 00 a0 00 8a 99 00 02 48 e8 c8 c0 10 d0 f5 68 99 00 02 c8 c0 20 d0 f7');
cpu.registers.pc = 0x0600;
cpu.steps(485);
assertEquals(cpu.registers.a, 0x00);
assertEquals(cpu.registers.x, 0x10);
assertEquals(cpu.registers.y, 0x20);
assertEquals(cpu.registers.sp, 0xFF);

// JMP
cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'a9 03 4c 08 06 00 00 00 8d 00 02');
cpu.registers.pc = 0x0600;
cpu.steps(10);
assertEquals(cpu.memory.readByte(0x0200), 0x03);


// JSR & RTS
cpu = new CPU;
cpu.memory.hexLoad(0x0600, '20 09 06 20 0c 06 20 12 06 a2 00 60 e8 e0 05 d0 fb 60 00');
cpu.registers.pc = 0x0600;
cpu.steps(63);
assertEquals(cpu.registers.a, 0x00);
assertEquals(cpu.registers.x, 0x05);
assertEquals(cpu.registers.y, 0x00);
assertEquals(cpu.registers.sp, 0xFD);
assertEquals(cpu.registers.pc, 0x0613);
assertEquals(cpu.registers.sr.z, 1);
assertEquals(cpu.registers.sr.c, 1);


// Branches: BEQ and BNE
cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'a9 00 d0 02 a9 99'); // LDA #$00, BNE end, LDA #$99, end: 
cpu.registers.pc = 0x0600;
cpu.steps(10);
assertEquals(cpu.registers.a, 0x99);

cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'a9 00 f0 02 a9 99'); // LDA #$00, BEQ end, LDA #$99, end: 
cpu.registers.pc = 0x0600;
cpu.steps(10);
assertEquals(cpu.registers.a, 0x00);

console.log('Test BIT');
cpu.memory.writeByte(0x01, 0xFF);
cpu.memory.writeByte(0xBEEF, 0x01);
cpu.memory.hexLoad(0x0600, 'a9 40 24 01 2c ef be'); // LDA #$40, BIT $01, BIT $BEEF
cpu.registers.pc = 0x0600;
cpu.steps(5);
// dumpCpu();
assertEquals(cpu.registers.sr.n, 1);
assertEquals(cpu.registers.sr.v, 1);
cpu.steps(4);
assertEquals(cpu.registers.sr.n, 0);
assertEquals(cpu.registers.sr.v, 0);
// dumpCpu();

console.log('Test AND');
cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'A9 69 85 0A A9 96 25 0A'); // LDA #$69, STA $0A, LDA #$96, AND $0A
cpu.registers.pc = 0x0600;
cpu.steps(10);
assertEquals(cpu.registers.a, 0x00);
assertEquals(cpu.registers.sr.z, 1);
cpu.memory.hexLoad(0x0600, 'A9 69 85 0A A9 69 25 0A'); // LDA #$69, STA $0A, LDA #$96, AND $0A
cpu.registers.pc = 0x0600;
cpu.steps(10);
assertEquals(cpu.registers.sr.z, 0);
assertEquals(cpu.registers.a, 0x69);

console.log('Test ASL');
cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'A9 F9 0A'); // LDA #$69, ASL
cpu.registers.pc = 0x0600;
cpu.steps(4);
assertEquals(cpu.registers.a, 0xF2);
assertEquals(cpu.registers.sr.c, 1);

cpu = new CPU;
cpu.memory.hexLoad(0x0600, 'a9 f9 85 0a 06 0a'); // LDA #$F9, STA $0A, ASL $0A
cpu.registers.pc = 0x0600;
cpu.steps(9);
assertEquals(cpu.registers.a, 0xF9);
assertEquals(cpu.registers.sr.c, 1);
assertEquals(cpu.memory.readByte(0x0A), 0xF2);






// Wozmon: D8 58 A0 7F 8C 12 D0 A9 A7 8D 11 D0 8D 13 D0 C9 DF F0 13 C9 9B F0 03 C8 10 0F A9 DC 20 EF FF A9 8D 20 EF FF A0 01 88 30 F6 AD 11 D0 10 FB AD 10 D0 99 00 02 20 EF FF C9 8D D0 D4 A0 FF A9 00 AA 0A 85 2B C8 B9 00 02 C9 8D F0 D4 C9 AE 90 F4 F0 F0 C9 BA F0 EB C9 D2 F0 3B 86 28 86 29 84 2A B9 00 02 49 B0 C9 0A 90 06 69 88 C9 FA 90 11 0A 0A 0A 0A A2 04 0A 26 28 26 29 CA D0 F8 C8 D0 E0 C4 2A F0 97 24 2B 50 10 A5 28 81 26 E6 26 D0 B5 E6 27 4C 44 FF 6C 24 00 30 2B A2 02 B5 27 95 25 95 23 CA D0 F7 D0 14 A9 8D 20 EF FF A5 25 20 DC FF A5 24 20 DC FF A9 BA 20 EF FF A9 A0 20 EF FF A1 24 20 DC FF 86 2B A5 24 C5 28 A5 25 E5 29 B0 C1 E6 24 D0 02 E6 25 A5 24 29 07 10 C8 48 4A 4A 4A 4A 20 E5 FF 68 29 0F 09 B0 C9 BA 90 02 69 06 2C 12 D0 30 FB 8D 12 D0 60 00 00 00 0F 00 FF 00 00
// Starts at FF00
// 
// cpu = new CPU;
// cpu.memory.hexLoad(0xFF00, 'D8 58 A0 7F 8C 12 D0 A9 A7 8D 11 D0 8D 13 D0 C9 DF F0 13 C9 9B F0 03 C8 10 0F A9 DC 20 EF FF A9 8D 20 EF FF A0 01 88 30 F6 AD 11 D0 10 FB AD 10 D0 99 00 02 20 EF FF C9 8D D0 D4 A0 FF A9 00 AA 0A 85 2B C8 B9 00 02 C9 8D F0 D4 C9 AE 90 F4 F0 F0 C9 BA F0 EB C9 D2 F0 3B 86 28 86 29 84 2A B9 00 02 49 B0 C9 0A 90 06 69 88 C9 FA 90 11 0A 0A 0A 0A A2 04 0A 26 28 26 29 CA D0 F8 C8 D0 E0 C4 2A F0 97 24 2B 50 10 A5 28 81 26 E6 26 D0 B5 E6 27 4C 44 FF 6C 24 00 30 2B A2 02 B5 27 95 25 95 23 CA D0 F7 D0 14 A9 8D 20 EF FF A5 25 20 DC FF A5 24 20 DC FF A9 BA 20 EF FF A9 A0 20 EF FF A1 24 20 DC FF 86 2B A5 24 C5 28 A5 25 E5 29 B0 C1 E6 24 D0 02 E6 25 A5 24 29 07 10 C8 48 4A 4A 4A 4A 20 E5 FF 68 29 0F 09 B0 C9 BA 90 02 69 06 2C 12 D0 30 FB 8D 12 D0 60 00 00 00 0F 00 FF 00 00');
// cpu.registers.pc = 0xFF00;
// cpu.steps(200);
// assertEquals(cpu.memory.readByte(0xFF00), 0xD8);


/*

Address  Hexdump   Dissassembly
-------------------------------
$0600    a0 01     LDY #$01
$0602    a9 03     LDA #$03
$0604    85 01     STA $01
$0606    a9 07     LDA #$07
$0608    85 02     STA $02
$060a    a2 0a     LDX #$0a
$060c    8e 04 07  STX $0704
$060f    b1 01     LDA ($01),Y


*/