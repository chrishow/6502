import { LitElement, css, html } from 'lit';
import { CPUDisplayBit } from './CPUDisplayBit';

export class CPUDisplay extends LitElement {
    static formatWord(word) {
        return word.toString(16).padStart(4, '0').toUpperCase();
    }

    static formatByte(byte) {
        return byte.toString(16).padStart(2, '0').toUpperCase();
    }

    static get properties() { return {
		registers: { 
            type: Object, 
            reflect: true, 
            attribute: true,
        }
	  }
	;}

	static styles = css`
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
            padding: 0.5em;
        }

        .buttons {
            clear: both;
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
	`;

	constructor() {
		super();
		// Declare reactive properties
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
	}

    step() {
        // console.log(this.cpu);
        this.cpu.step();
    }

    start() {
        this.cpu.start();
    }

    stop() {
        this.cpu.stop();
    }


	// Render the UI as a function of component state
	render() {
		return html`<table>
        <tr>
            <th>PC</th>
            <td>0x${CPUDisplay.formatWord(this.registers.pc)}</td>
        </tr>
        <tr>
            <th>AC</th>
            <td>0x${CPUDisplay.formatByte(this.registers.ac)}</td>
        </tr>
        <tr>
            <th>X</th>
            <td>0x${CPUDisplay.formatByte(this.registers.x)}</td>
        </tr>
        <tr>
            <th>Y</th>
            <td>0x${CPUDisplay.formatByte(this.registers.y)}</td>
        </tr>        
        <tr>
            <th>SP</th>
            <td>0x${CPUDisplay.formatByte(this.registers.sp)}</td>
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

    <table class=memory>
        <tr><td class='${this.registers.pc == 0 ? 'active' : ''}'>0x00</td><td>${CPUDisplay.formatByte(this.memory._mem[0])}</td></tr>
        <tr><td class='${this.registers.pc == 1 ? 'active' : ''}'>0x01</td><td>${CPUDisplay.formatByte(this.memory._mem[1])}</td></tr>
        <tr><td class='${this.registers.pc == 2 ? 'active' : ''}'>0x02</td><td>${CPUDisplay.formatByte(this.memory._mem[2])}</td></tr>
        <tr><td class='${this.registers.pc == 3 ? 'active' : ''}'>0x03</td><td>${CPUDisplay.formatByte(this.memory._mem[3])}</td></tr>
        <tr><td class='${this.registers.pc == 4 ? 'active' : ''}'>0x04</td><td>${CPUDisplay.formatByte(this.memory._mem[4])}</td></tr>
        <tr><td class='${this.registers.pc == 5 ? 'active' : ''}'>0x05</td><td>${CPUDisplay.formatByte(this.memory._mem[5])}</td></tr>
        <tr><td class='${this.registers.pc == 6 ? 'active' : ''}'>0x06</td><td>${CPUDisplay.formatByte(this.memory._mem[6])}</td></tr>        
        <tr><td class='${this.registers.pc == 7 ? 'active' : ''}'>0x07</td><td>${CPUDisplay.formatByte(this.memory._mem[7])}</td></tr>        
        <tr><td class='${this.registers.pc == 8 ? 'active' : ''}'>0x08</td><td>${CPUDisplay.formatByte(this.memory._mem[8])}</td></tr>        
        <tr><td class='${this.registers.pc == 9 ? 'active' : ''}'>0x09</td><td>${CPUDisplay.formatByte(this.memory._mem[9])}</td></tr>        
        <tr><td class='${this.registers.pc == 0x0A ? 'active' : ''}'>0x0A</td><td>${CPUDisplay.formatByte(this.memory._mem[0x0A])}</td></tr>        
    </table>

    <div class=buttons>
        <button @click="${this.step}">Step</button>
        <button @click="${this.start}">Start</button>
        <button @click="${this.stop}">Stop</button>
    </div>
`;
	}
}

customElements.define('cpu-display', CPUDisplay);
