import { LitElement, css, html } from 'lit';
import { CPUDisplayBit } from './CPUDisplayBit';

export class CPUDisplay extends LitElement {
	static get properties() { return {
		cpu: { 
            type: Object, 
            reflect: false, 
            attribute: false,            
        },
	  }
	;}

	static styles = css`
		table {
			background-color: #ddd;
		}

		th {
			text-align: right;
		}

		th, 
		td {
			background-color: white;
			padding: 0.2em;
		}

        table.flags th, 
        table.flags td {
            text-align: center;
        }
	`;

	constructor() {
		super();
		// Declare reactive properties
		this.cpu = {
            pc: 0,
            ac: 0,
            x: 0,
            y: 0,
            sp: 0,
			sr: {
                n: 1
            }
		};
	}

    step() {
        this.cpu.step();
    }

	// Render the UI as a function of component state
	render() {
		return html`<table>
        <tr>
            <th>PC</th>
            <td>0x${this.cpu.pc.toString(16).padStart(2, '0')}</td>
        </tr>
        <tr>
            <th>AC</th>
            <td>0x${this.cpu.ac.toString(16).padStart(2, '0')}</td>
        </tr>
        <tr>
            <th>X</th>
            <td>0x${this.cpu.x.toString(16).padStart(2, '0')}</td>
        </tr>
        <tr>
            <th>Y</th>
            <td>0x${this.cpu.y.toString(16).padStart(2, '0')}</td>
        </tr>        
        <tr>
            <th>SP</th>
            <td>0x${this.cpu.sp.toString(16).padStart(2, '0')}</td>
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
                <td><cpu-display-bit .bit=${this.cpu.sr.n}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.cpu.sr.v}></cpu-display-bit></td>
                <td>-</td>
                <td><cpu-display-bit .bit=${this.cpu.sr.b}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.cpu.sr.d}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.cpu.sr.i}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.cpu.sr.z}></cpu-display-bit></td>
                <td><cpu-display-bit .bit=${this.cpu.sr.c}></cpu-display-bit></td>
            </tr>
        </table>
            </td>
        </tr>
        
    </table>
    <button @click="${this.step}">Step</button>
`;
	}
}

customElements.define('cpu-display', CPUDisplay);
