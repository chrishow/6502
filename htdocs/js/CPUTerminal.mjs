import { LitElement, css, html } from 'lit';

export class CPUTerminal extends LitElement {
    static MAX_COLS = 40;
    static MAX_ROWS = 24;

    constructor() {
        super();

        this.hasKey = false;
        this.currentKey = null;
        this.content = '';

        this.addEventListener('keydown', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const keysToIgnore = ['Shift', 'Meta', 'Alt', 'Control','Escape','ArrowUp','ArrowDown', 'ArrowRight', 'ArrowLeft'];
            // console.log('keyDown: ', e.key);

            if(this.hasKey) {
                // We already have a key
                return;
            }

            // Ignore these keys
            if(keysToIgnore.includes(e.key)) {
                return false;
            }

            // Map some keys to other codes
            if(e.key === 'Enter') {
                this.currentKey = 10;
            } else {
                this.currentKey = e.key.charCodeAt(0);
            }

            this.hasKey = true;
            // console.log('currentKey: ', this.currentKey);
        });

    }

    /**
     * Component's reactive properties
     */
    static get properties() { return {
		content: undefined
	  }
	}


    firstUpdated() {
        this.terminalDiv = this.renderRoot.querySelector('.terminal');
        this.terminalDiv.focus();

        // Patch memory for display
        this.cpu.memory.addPatch({
            start: 0xD012,
            end: 0xD012,
            readCallback: this.displayIsReady,
            writeCallback: this.displayCharacter.bind(this),
        });

        // Keyboard control register $D011
        this.cpu.memory.addPatch({
            start: 0xD011,
            end: 0xD011,
            readCallback: this.keyboardHasKeyToSend.bind(this),
        });

        // Keyboard input $D010
        this.cpu.memory.addPatch({
            start: 0xD010,
            end: 0xD010,
            readCallback: this.getKey.bind(this),
        });
    }

    /**
     * Check if we have a key to send
     * 
     * @returns {number} Do we have a key press to send? 
     */
    keyboardHasKeyToSend() {
        if(this.hasKey) {
            return 0xF1; // bit 6 set
        } else {
            return 0x01; // bit 6 clear
        }
    }

    /**
     * Gets current key and resets hasKey to false
     * 
     * @returns {number} Current key
     */
    getKey() {
        this.hasKey = false;
        return(this.currentKey);
    }


    /**
     * Check if display is ready 
     * @returns {number} Is the display ready? Number with bit 6 set? no, Number with bit 6 clear? yes
     */
    displayIsReady() {
        return 0x01; // a number with bit 6 clear because it's always ready
    }

    displayCharacter(location, character) {
        this.content += String.fromCharCode(character);

        if((this.content.length + 1) % CPUTerminal.MAX_COLS == 0) {
            this.content += "\n"; // Start a new row
        }
        if(this.content.length > (CPUTerminal.MAX_COLS * CPUTerminal.MAX_ROWS)) {
            // Have reached bottom of screen, remove top 'row', scrolling up a line
            this.content = this.content.substring(CPUTerminal.MAX_COLS);
        }
    }


    static styles = css`
    :root {
        color: var(--fg-color, white);
        background-color: var(--bg-color, #333);
    }
    
    .terminal {
        word-wrap: break-word;
        white-space: pre;
        /* opacity: 0.5; */
        --padding-block: 2em;
        --padding-inline: 2ch;
        padding: var(--padding-block) var(--padding-inline);
        font-size: 14px;
        line-height: 1.5;
        position: relative;
        font-family: var(--font-family, monospace);
        font-weight: normal;
        // text-transform: uppercase;
        background-color: #333; 
        color: white;
        width: 40ch;
        height: calc(32em + var(--padding-block) + var(--padding-block));
        overflow: hidden;        
    }

    .terminal:focus-visible,
    .terminal:focus {
        /* opacity: 1; */
        /* outline: none; */
    }

    .terminal span.cursor { 
        animation: blink 0.75s infinite;
    }


    @keyframes blink {
        0% {
            opacity: 0;
        }

        49% {
            opacity: 0;
        }

        50% {
            opacity: 1;
        }
    }

    @keyframes flicker {
        0% {
        opacity: 0.27861;
        }
        5% {
        opacity: 0.34769;
        }
        10% {
        opacity: 0.23604;
        }
        15% {
        opacity: 0.90626;
        }
        20% {
        opacity: 0.18128;
        }
        25% {
        opacity: 0.83891;
        }
        30% {
        opacity: 0.65583;
        }
        35% {
        opacity: 0.67807;
        }
        40% {
        opacity: 0.26559;
        }
        45% {
        opacity: 0.84693;
        }
        50% {
        opacity: 0.96019;
        }
        55% {
        opacity: 0.08594;
        }
        60% {
        opacity: 0.20313;
        }
        65% {
        opacity: 0.71988;
        }
        70% {
        opacity: 0.53455;
        }
        75% {
        opacity: 0.37288;
        }
        80% {
        opacity: 0.71428;
        }
        85% {
        opacity: 0.70419;
        }
        90% {
        opacity: 0.7003;
        }
        95% {
        opacity: 0.36108;
        }
        100% {
        opacity: 0.24387;
        }
    }
    @keyframes textShadow {
        0% {
        text-shadow: 0.4389924193300864px 0 1px rgba(0,30,255,0.5), -0.4389924193300864px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        5% {
        text-shadow: 2.7928974010788217px 0 1px rgba(0,30,255,0.5), -2.7928974010788217px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        10% {
        text-shadow: 0.02956275843481219px 0 1px rgba(0,30,255,0.5), -0.02956275843481219px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        15% {
        text-shadow: 0.40218538552878136px 0 1px rgba(0,30,255,0.5), -0.40218538552878136px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        20% {
        text-shadow: 3.4794037899852017px 0 1px rgba(0,30,255,0.5), -3.4794037899852017px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        25% {
        text-shadow: 1.6125630401149584px 0 1px rgba(0,30,255,0.5), -1.6125630401149584px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        30% {
        text-shadow: 0.7015590085143956px 0 1px rgba(0,30,255,0.5), -0.7015590085143956px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        35% {
        text-shadow: 3.896914047650351px 0 1px rgba(0,30,255,0.5), -3.896914047650351px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        40% {
        text-shadow: 3.870905614848819px 0 1px rgba(0,30,255,0.5), -3.870905614848819px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        45% {
        text-shadow: 2.231056963361899px 0 1px rgba(0,30,255,0.5), -2.231056963361899px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        50% {
        text-shadow: 0.08084290417898504px 0 1px rgba(0,30,255,0.5), -0.08084290417898504px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        55% {
        text-shadow: 2.3758461067427543px 0 1px rgba(0,30,255,0.5), -2.3758461067427543px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        60% {
        text-shadow: 2.202193051050636px 0 1px rgba(0,30,255,0.5), -2.202193051050636px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        65% {
        text-shadow: 2.8638780614874975px 0 1px rgba(0,30,255,0.5), -2.8638780614874975px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        70% {
        text-shadow: 0.48874025155497314px 0 1px rgba(0,30,255,0.5), -0.48874025155497314px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        75% {
        text-shadow: 1.8948491305757957px 0 1px rgba(0,30,255,0.5), -1.8948491305757957px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        80% {
        text-shadow: 0.0833037308038857px 0 1px rgba(0,30,255,0.5), -0.0833037308038857px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        85% {
        text-shadow: 0.09769827255241735px 0 1px rgba(0,30,255,0.5), -0.09769827255241735px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        90% {
        text-shadow: 3.443339761481782px 0 1px rgba(0,30,255,0.5), -3.443339761481782px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        95% {
        text-shadow: 2.1841838852799786px 0 1px rgba(0,30,255,0.5), -2.1841838852799786px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
        100% {
        text-shadow: 2.6208764473832513px 0 1px rgba(0,30,255,0.5), -2.6208764473832513px 0 1px rgba(255,0,80,0.3), 0 0 3px;
        }
    }
    .terminal::after {
        content: " ";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: rgba(18, 16, 16, 0.1);
        opacity: 0;
        z-index: 2;
        pointer-events: none;
        animation: flicker 0.15s infinite;
    }
    .terminal::before {
        content: " ";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
        z-index: 2;
        background-size: 100% 2px, 3px 100%;
        pointer-events: none;
    }
    .terminal {
        animation: textShadow 1.6s infinite;
    }
    
    `;    

    render() {
        // console.log('render');
        return html`<div class='terminal' tabIndex=0>${this.content}<span class=cursor>@</span></div>`;
    }
}
customElements.define('cpu-terminal', CPUTerminal);
