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

	// cpu.memory.hexLoad(0x600, '69 01 8D 0A 00 4C 00 00');
	// cpu.memory.hexLoad(0x600, 'A9 FE 18 69 01 8D 0A 00');
	// cpu.memory.hexLoad(0x600, 'a9 c0 aa e8 69 c4 00');
	// cpu.memory.hexLoad(0x600, 'a2 00 e8 8e 20 06 4c 02 06');
	
	// cpu.memory.hexLoad(0x600, 'a2 08 ca 8e 00 02 e0 03 d0 f8 8e 01 02 00');
	// cpu.memory.hexLoad(0x600, 'a9 01 c9 02 d0 02 85 22 00');
	// cpu.memory.hexLoad(0x600, 'a9 01 85 f0 a9 cc 85 f1 6c f0 00');
	// cpu.memory.hexLoad(0x0600, 'a0 01 a9 03 85 01 a9 07 85 02 a2 0a 8e 04 07 b1 01');
	// cpu.memory.hexLoad(0x0600, 'a2 00 a0 00 8a 99 00 02 48 e8 c8 c0 10 d0 f5 68 99 00 02 c8 c0 20 d0 f7');
	// cpu.memory.hexLoad(0x0600, '20 09 06 20 0c 06 20 12 06 a2 00 60 e8 e0 05 d0 fb 60 00');

	// WOZMON
	// cpu.memory.hexLoad(0xFF00, 'D8 58 A0 7F 8C 12 D0 A9 A7 8D 11 D0 8D 13 D0 C9 DF F0 13 C9 9B F0 03 C8 10 0F A9 DC 20 EF FF A9 8D 20 EF FF A0 01 88 30 F6 AD 11 D0 10 FB AD 10 D0 99 00 02 20 EF FF C9 8D D0 D4 A0 FF A9 00 AA 0A 85 2B C8 B9 00 02 C9 8D F0 D4 C9 AE 90 F4 F0 F0 C9 BA F0 EB C9 D2 F0 3B 86 28 86 29 84 2A B9 00 02 49 B0 C9 0A 90 06 69 88 C9 FA 90 11 0A 0A 0A 0A A2 04 0A 26 28 26 29 CA D0 F8 C8 D0 E0 C4 2A F0 97 24 2B 50 10 A5 28 81 26 E6 26 D0 B5 E6 27 4C 44 FF 6C 24 00 30 2B A2 02 B5 27 95 25 95 23 CA D0 F7 D0 14 A9 8D 20 EF FF A5 25 20 DC FF A5 24 20 DC FF A9 BA 20 EF FF A9 A0 20 EF FF A1 24 20 DC FF 86 2B A5 24 C5 28 A5 25 E5 29 B0 C1 E6 24 D0 02 E6 25 A5 24 29 07 10 C8 48 4A 4A 4A 4A 20 E5 FF 68 29 0F 09 B0 C9 BA 90 02 69 06 2C 12 D0 30 FB 8D 12 D0 60 00 00 00 0F 00 FF 00 00');
	// cpu.registers.pc = 0xFF00; 

	// AND
	// cpu.memory.hexLoad(0x0600, 'A9 69 85 0A A9 96 25 0A');

	// PHP
	cpu.memory.hexLoad(0x0600, '08');

	cpu.registers.pc = 0x0600; 
	
	

	// cpu.registers.pc = 0x0600;
		
	
	window.cpu = cpu;


	cpu.boot();
});