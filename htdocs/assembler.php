<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Assembler</title>
	<link rel="stylesheet" href="/css/styles.css?v=<?= filemtime('css/styles.css') ?>">
</head>
<body>

	<h1>asm</h1>

<textarea class=asm autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
;  The WOZ Monitor for the Apple 1
;  Written by Steve Wozniak in 1976

; Page 0 Variables

XAML            = $24           ;  Last "opened" location Low
XAML_minus_1	= $23
XAMH            = $25           ;  Last "opened" location High
STL             = $26           ;  Store address Low
STL_minus_1     = $25
STH             = $27           ;  Store address High
L               = $28           ;  Hex value parsing Low
L_minus_1       = $27
H               = $29           ;  Hex value parsing High
YSAV            = $2A           ;  Used to see if hex value is given
MODE            = $2B           ;  $00=XAM, $7F=STOR, $AE=BLOCK XAM



; Other Variables

IN              = $0200         ;  Input buffer to $027F
KBD             = $D010         ;  PIA.A keyboard input
KBDCR           = $D011         ;  PIA.A keyboard control register
DSP             = $D012         ;  PIA.B display output register
DSPCR           = $D013         ;  PIA.B display control register

CR              = $0A           ; Carriage return
ESC             = $1b           ; Escape

NMI             = $0F00


              .org $FF00


RESET:          CLD             ; Clear decimal arithmetic mode.
                CLI
                LDY #$7F        ; Mask for DSP data direction register.
                STY DSP         ; Set it up.
                LDA #$A7        ; KBD and DSP control register mask.
                STA KBDCR       ; Enable interrupts, set CA1, CB1, for
                STA DSPCR       ;  positive edge sense/output mode.
NOTCR:          CMP #'_'        ; "_"?
                BEQ BACKSPACE   ; Yes.
                CMP #ESC        ; ESC?
                BEQ ESCAPE      ; Yes.
                INY             ; Advance text index.
                BPL NEXTCHAR    ; Auto ESC if line length  > 127.
ESCAPE:         LDA #'\'        ; "\".
                JSR ECHO        ; Output it.
GETLINE:        LDA #CR         ; CR.
                JSR ECHO        ; Output it.
                LDY #$01        ; Initialize text index.
BACKSPACE:      DEY             ; Back up text index.
                BMI GETLINE     ; Beyond start of line, reinitialize.
NEXTCHAR:       LDA KBDCR       ; Key ready?
                BPL NEXTCHAR    ; Loop until ready.
                LDA KBD         ; Load character. B7 should be '0'.
                STA IN,Y        ; Add to text buffer.
                JSR ECHO        ; Display character.
                CMP #CR         ; CR?
                BNE NOTCR       ; No.
                LDY #$FF        ; Reset text index.
                LDA #$00        ; For XAM mode.
                TAX             ; 0->X.
SETBLOCK:       ASL             ; 
SETSTOR:        ASL             ; Leaves $7B if setting STOR mode.
SETMODE:        STA MODE        ; $00=XAM, $7B=STOR, $AE=BLOCK XAM.
BLSKIP:         INY             ; Advance text index.
NEXTITEM:       LDA IN,Y        ; Get character.
                CMP #CR         ; CR?
                BEQ GETLINE     ; Yes, done this line.
                CMP #'.'        ; "."?
                BCC BLSKIP      ; Skip delimiter.
                BEQ SETBLOCK    ; Set BLOCK XAM mode.
                CMP #':'        ; ":"?
                BEQ SETSTOR     ; Yes. Set STOR mode.
                CMP #'R'        ; "R"?
                BEQ RUN         ; Yes. Run user program.
                STX L           ; $00->L.
                STX H           ;  and H.
                STY YSAV        ; Save Y for comparison.                
NEXTHEX:        LDA IN,Y        ; Get character for hex test.
                EOR #$30        ; Map digits to $0-9.
                CMP #$0A        ; Digit?
                BCC DIG         ; Yes.
                ADC #$88        ; Map letter "A"-"F" to $FA-FF.
                CMP #$FA        ; Hex letter?
                BCC NOTHEX      ; No, character not hex.
DIG:            ASL
                ASL             ; Hex digit to MSD of A.
                ASL
                ASL
                LDX #$04        ; Shift count.
HEXSHIFT:       ASL             ; Hex digit left, MSB to carry.
                ROL L           ; Rotate into LSD.
                ROL H           ; Rotate into MSD's.
                DEX             ; Done 4 shifts?
                BNE HEXSHIFT    ; No, loop.
                INY             ; Advance text index.
                BNE NEXTHEX     ; Always taken. Check next character for hex.
NOTHEX:         
                CPY YSAV        ; Check if L, H empty (no hex digits).
                BEQ ESCAPE      ; Yes, generate ESC sequence.
                BIT MODE        ; Test MODE byte.
                BVC NOTSTOR     ; B6=0 STOR, 1 for XAM and BLOCK XAM
                LDA L           ; LSD's of hex data.
                STA (STL,X)     ; Store at current 'store index'.
                INC STL         ; Increment store index.
                BNE NEXTITEM    ; Get next item. (no carry).
                INC STH         ; Add carry to 'store index' high order.
TONEXTITEM:     JMP NEXTITEM    ; Get next command item.
RUN:            JMP (XAML)      ; Run at current XAM index.
NOTSTOR:        BMI XAMNEXT     ; B7=0 for XAM, 1 for BLOCK XAM.
                LDX #$02        ; Byte count.
SETADR:         LDA L_minus_1,X       ; Copy hex data to
                STA STL_minus_1,X     ;  'store index'.
                STA XAML_minus_1,X    ; And to 'XAM index'.
                DEX             ; Next of 2 bytes.
                BNE SETADR      ; Loop unless X=0.
NXTPRNT:        BNE PRDATA      ; NE means no address to print.
                LDA #CR         ; CR.
                JSR ECHO        ; Output it.
                LDA XAMH        ; 'Examine index' high-order byte.
                JSR PRBYTE      ; Output it in hex format.
                LDA XAML        ; Low-order 'examine index' byte.
                JSR PRBYTE      ; Output it in hex format.
                LDA #':'        ; ":".
                JSR ECHO        ; Output it.
PRDATA:         LDA #$20        ; Blank.
                JSR ECHO        ; Output it.
                LDA (XAML,X)    ; Get data byte at 'examine index'.
                JSR PRBYTE      ; Output it in hex format.
XAMNEXT:        STX MODE        ; 0->MODE (XAM mode).
                LDA XAML
                CMP L           ; Compare 'examine index' to hex data.
                LDA XAMH
                SBC H
                BCS TONEXTITEM  ; Not less, so no more data to output.
                INC XAML
                BNE MOD8CHK     ; Increment 'examine index'.
                INC XAMH
MOD8CHK:        LDA XAML        ; Check low-order 'examine index' byte
                AND #$07        ;  For MOD 8=0
                BPL NXTPRNT     ; Always taken.
PRBYTE:         PHA             ; Save A for LSD.
                LSR
                LSR
                LSR             ; MSD to LSD position.
                LSR
                JSR PRHEX       ; Output hex digit.
                PLA             ; Restore A.
PRHEX:          
                AND #$0F        ; Mask LSD for hex print.
                ORA #'0'       ; Add "0".
                CMP #$3A        ; Digit?
                BCC ECHO        ; Yes, output it.
                ADC #$06        ; Add offset for letter.
ECHO:           BIT DSP         ; DA bit (B7) cleared yet?
                BMI ECHO        ; No, wait for display.
                STA DSP         ; Output character. Sets DA.
                RTS             ; Return.

                ; BRK             ; unused
                ; BRK             ; unused

; Interrupt Vectors

                .WORD NMI     ; NMI
                .WORD RESET     ; RESET
                .WORD $0000     ; BRK/IRQ

</textarea>
<div class=hex autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
<br>
<textarea class=info autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
<br>
<button class='assemble'>Assemble</button>

<script src='/js/scripts-dist.js?v=<?= filemtime('js/scripts-dist.js') ?>' type=module></script>
<script>
const asm = document.querySelector('.asm');
const hex = document.querySelector('.hex');
const info = document.querySelector('.info');

document.addEventListener('DOMContentLoaded', () => {
  const storedAsm = localStorage.getItem('asm');
  if(storedAsm) {
    asm.value = storedAsm;
  }
});

// Trap tab in asm
asm.addEventListener('keydown', function(e) {
  if (e.key == 'Tab') {
    e.preventDefault();
    var start = this.selectionStart;
    var end = this.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    this.value = this.value.substring(0, start) +
      "\t" + this.value.substring(end);

    // put caret at right position again
    this.selectionStart =
      this.selectionEnd = start + 1;
  } else if (e.key == 's' && e.metaKey) {
    e.preventDefault();
    // Compile    
    startAssembly();
  }

//   e.preventDefault();
//   console.log(e);
});

document.querySelector('.assemble').addEventListener('click', (e) => {
  startAssembly();
});


function startAssembly() {
  localStorage.setItem('asm', asm.value);
  
  info.textContent = '';

  try {
    const output = assemble(asm);
    hex.innerHTML = output;
    // const strippedOutput = hex.textContent.replace(/\s/g, '');
    
    info.textContent = asm.value.split(/\n/).length + ' lines assembled successfully';
  } catch (error) {
    info.textContent = error;
  }



}

asm.focus();


</script>

</body>
</html>