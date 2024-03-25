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
            padding: 0;
            border: 0;
            font-size: 400%;
            cursor: pointer;
            margin-right: 0.125em;
            position: relative;
        }

        button:active {
            left: 1px;
            top: 1px;
        }

        .buttons {
            clear: both;
            font-family: sans-serif;
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

        .memory {
            > span {
                background-color: pink;
            }
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
        let memDisplay = [];
        let j = 0;
        for(let i = 0; i < 8; i++) {
            memDisplay.push(html`0x${CPUDisplay.formatWord((i*8)+j)}: `);
            for(let j = 0; j < 8; j++) {
                let addr = (i*8)+j;
                if(this.registers.pc == addr) {
                    memDisplay.push(html`<span>${CPUDisplay.formatByte(this.memory._mem[(i*8)+j])}</span> `);

                } else {
                    memDisplay.push(html`${CPUDisplay.formatByte(this.memory._mem[(i*8)+j])} `);
                }
            }
            memDisplay.push(html`<br>\n`);
        }

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

    <div class=memory>
${memDisplay}
    </div>

    <div class=buttons>
        <button @click="${this.step}" title='Step'>⏯</button>
        <button @click="${this.start}" title='Start'>▶️</button>
<!--        <button @click="${this.fast}">⏩</button> -->
        <button @click="${this.stop}" title='Stop'>⏹</button>
    </div>
`;
	}
}

customElements.define('cpu-display', CPUDisplay);
