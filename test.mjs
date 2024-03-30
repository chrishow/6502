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

function dumpCpu() {
    console.log(`PC : ${dec2hexWord(cpu.registers.pc)}`);
    console.log(`ac : ${dec2hexWord(cpu.registers.a)}`);
    console.log(`x : ${dec2hexWord(cpu.registers.x)}`);
    console.log(`y : ${dec2hexWord(cpu.registers.y)}`);
    // console.log(`acc : ${dec2hexWord(cpu.registers.acc)}`);
}    

function dec2hexWord(dec) {
    return dec.toString(16).padStart(4, '0').toUpperCase();
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

// cpu = new CPU;
// cpu.memory.hexLoad(0x0600, 'a2 00 a0 00 8a 99 00 02 48 e8 c8 c0 10 d0 f5 68 99 00 02 c8 c0 20 d0 f7');
// cpu.registers.pc = 0x0600;
// cpu.steps(25);
// assert(cpu.registers.a == 0x0A);
// assert(cpu.registers.x == 0x0A);
// assert(cpu.registers.y == 0x01);


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