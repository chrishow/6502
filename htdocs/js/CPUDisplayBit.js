import { LitElement, html } from 'lit';


export class CPUDisplayBit extends LitElement {
	static get properties() { return {
		bit: {reflect: false, attribute: false}
	  }
	;}

	constructor() {
		super();
		// Declare reactive properties
		this.bit = 0;
	}

	// Render the UI as a function of component state
	render() {
		return html`${(this.bit == 1) ? '🔴' : '⚪️'}`;
	}
}

customElements.define('cpu-display-bit', CPUDisplayBit);
