import { LitElement, html } from 'lit';


export class CPUDisplayFlags extends LitElement {
	static get properties() { return {
		flags: {type: Object, reflect: true, attribute: true}
	  }
	;}

	constructor() {
		super();
		// Declare reactive properties
		this.flags = {
            n: 0,
            v: 0,
            b: 0,
            d: 0,
            i: 0,
            z: 0,
            c: 0,
        };
	}

	// Render the UI as a function of component state
	render() {
		return html`<table class=flags>
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
            <td><cpu-display-bit .bit=${this.flags.n}></cpu-display-bit></td>
            <td><cpu-display-bit .bit=${this.flags.v}></cpu-display-bit></td>
            <td>-</td>
            <td><cpu-display-bit .bit=${this.flags.b}></cpu-display-bit></td>
            <td><cpu-display-bit .bit=${this.flags.d}></cpu-display-bit></td>
            <td><cpu-display-bit .bit=${this.flags.i}></cpu-display-bit></td>
            <td><cpu-display-bit .bit=${this.flags.z}></cpu-display-bit></td>
            <td><cpu-display-bit .bit=${this.flags.c}></cpu-display-bit></td>
        </tr>
    </table>`;
	}
}

customElements.define('cpu-display-flags', CPUDisplayFlags);
