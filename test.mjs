import { CPU } from './htdocs/js/CPU.mjs';

let cpu = new CPU;
let i;

function assert(test) {
    if(!test) {
        console.log('Test failed!');
        console.trace();
        console.log(cpu.registers);
    }
}



// ADC %
cpu.memory.hexLoad(0x00, '69 69 69 01');
cpu.steps(10);

assert(cpu.registers.ac == 0x6A);
assert(cpu.registers.sr.n == 0);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, '69 69 69 69');
cpu.steps(4);
assert(cpu.registers.ac == 0xD2);
assert(cpu.registers.sr.n == 1);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, '69 69 69 97');
cpu.steps(4);
assert(cpu.registers.ac == 0x00);
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

// 0xA9: // LDA immediate
cpu = new CPU;
cpu.memory.hexLoad(0x00, 'A9 69');
cpu.steps(4);
assert(cpu.registers.ac == 0x69);
assert(cpu.registers.sr.n == 0);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, 'A9 FA');
cpu.steps(4);
assert(cpu.registers.ac == 0xFA);
assert(cpu.registers.sr.n == 1);
assert(cpu.registers.sr.z == 0);
assert(cpu.registers.sr.c == 0);

cpu = new CPU;
cpu.memory.hexLoad(0x00, 'A9 69 A9 00');
cpu.steps(4);
assert(cpu.registers.ac == 0x00);
assert(cpu.registers.sr.n == 0);
assert(cpu.registers.sr.z == 1);
assert(cpu.registers.sr.c == 0);

// 0x4C: // JMP, 3 cycles
cpu = new CPU;
// console.log(cpu.registers.pc);
cpu.memory.hexLoad(0x00, '4C EF BE');
cpu.steps(3);
assert(cpu.registers.pc == 0xBEEF);

// console.log(CPU.dec2hexByte(cpu.registers.pc));
