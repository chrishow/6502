import { CPUDisplay } from "./CPUDisplay.js";
import { CPU } from './CPU.js';



document.addEventListener("DOMContentLoaded", function () {

	const cpu = new CPU;

	const displayElement = document.querySelector('cpu-display');

	displayElement.cpu = cpu;

	cpu.memory.writeByte(0, 0xA2); // LDA immediate
	cpu.memory.writeByte(1, 0x81); // Operand
	cpu.fetchAndExecute();

	// console.log('displayElement.cpu.memory', displayElement.cpu.memory);


	displayElement.addEventListener('blinkLights', (e) => {
		const displayElement = e.target;
		for (const flag in displayElement.cpu.sr) {
			displayElement.cpu.sr[flag] = Math.round(Math.random());
		}

		['pc', 'ac', 'x', 'y', 'sp'].forEach((register) => {
			cpu[register] = Math.round(Math.random()*100);
		});

		displayElement.cpu = cloneCpuData(cpu);
		// displayElement.cpu = cpu;



		// console.log(displayElement.cpu.sr);
	});

	
	// displayElement.dispatchEvent(new CustomEvent('blinkLights'));

	// setInterval(() => {
	// 	displayElement.dispatchEvent(new CustomEvent('blinkLights'));
	// }, 1000);

});

function cloneCpuData(cpu) {
	// Make a new copy
	const newCpu = {...cpu};

	for(const flag in cpu.sr) {
		newCpu.sr[flag] = cpu.sr[flag];
	}
	
	// console.log(newCpu);

	return newCpu;
}
