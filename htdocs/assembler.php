<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Assembler</title>
	<link rel="stylesheet" href="/css/styles.css?v=<?= filemtime('css/styles.css') ?>">
</head>
<body>

	<h1>asm</h1>

<textarea class=asm autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
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
    hex.innerHTML = assemble(asm);
  } catch (error) {
    info.textContent = error;
  }


}

asm.focus();


</script>

</body>
</html>