import { CPU } from './CPU.mjs';



document.addEventListener("DOMContentLoaded", function () {

	const displayElement = document.querySelector('.display');

	const cpu = new CPU({
		displayContainer: displayElement
	});

	let PC = 0;

	// cpu.memory.writeByte(PC++, 0x69); // LDA immediate
	// cpu.memory.writeByte(PC++, 0x01); // Operand
	// cpu.memory.writeByte(PC++, 0x4C); // JMP
	// cpu.memory.writeByte(PC++, 0x00); // Low 
	// cpu.memory.writeByte(PC++, 0x00); // High

	// cpu.memory.hexLoad(0x00, '69 01 8D 0A 00 4C 00 00');
	// cpu.memory.hexLoad(0x00, 'A9 FE 18 69 01 8D 0A 00');
	// cpu.memory.hexLoad(0x00, 'a9 c0 aa e8 69 c4 00');
	// cpu.memory.hexLoad(0x00, 'a2 08 ca 8e 00 02 e0 03 d0 f8 8e 01 02 00');
	// cpu.memory.hexLoad(0x00, 'a9 01 c9 02 d0 02 85 22 00');
	// cpu.memory.hexLoad(0x00, 'a9 01 85 f0 a9 cc 85 f1 6c f0 00');
	// cpu.memory.hexLoad(0x0600, 'a0 01 a9 03 85 01 a9 07 85 02 a2 0a 8e 04 07 b1 01');
	cpu.memory.hexLoad(0x0600, 'a2 00 a0 00 8a 99 00 02 48 e8 c8 c0 10 d0 f5 68 99 00 02 c8 c0 20 d0 f7');

	

	cpu.registers.pc = 0x0600;
		
	
	window.cpu = cpu;


	cpu.boot();
});