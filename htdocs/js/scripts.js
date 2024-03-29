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
	cpu.memory.hexLoad(0x00, 'a2 08 ca 8e 00 02 e0 03 d0 f8 8e 01 02 00');
	
	 


	cpu.boot();
});