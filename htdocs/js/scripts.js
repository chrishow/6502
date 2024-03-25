import { CPU } from './CPU.js';



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

	cpu.memory.hexLoad(0x00, '69 01 8D 0A 00 0A 4C 00 00');


	cpu.boot();
});