import { CPU } from './CPU.js';



document.addEventListener("DOMContentLoaded", function () {

	const displayElement = document.querySelector('.display');

	const cpu = new CPU({
		displayContainer: displayElement
	});

	let PC = 0;


	cpu.memory.writeByte(PC++, 0xA2); // LDA immediate
	cpu.memory.writeByte(PC++, 0xF3); // Operand
	cpu.memory.writeByte(PC++, 0xA2); // LDA immediate
	cpu.memory.writeByte(PC++, 0x00); // Operand
	cpu.memory.writeByte(PC++, 0x4C); // JMP
	cpu.memory.writeByte(PC++, 0x00); // Low 
	cpu.memory.writeByte(PC++, 0x00); // High
});