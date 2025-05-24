const SOCKET_URL = window.location.host;
const socket = io.connect(SOCKET_URL);  // Default namespace '/'

let osc, reverb, playing, ampMult = 4;
let currentColor = 'blue';
let midiNotes = [60, 62, 64, 65, 67, 69, 71, 72];
let currentWaveform = 'sine';  // Default waveform

function setup() {
  let cnv = createCanvas(window.innerWidth, window.innerHeight);
  cnv.mousePressed(playOscillator);

  osc = new p5.Oscillator('sine');
  // reverb = new p5.Reverb();
  // reverb.process(osc, 3, 0.7);

  // Listen for remote drawing
  socket.on("userUpdate", onDrawData);
}

function draw() {
  if (mouseIsPressed) {
    let index = floor(map(mouseX, 0, width, 0, midiNotes.length));
    index = constrain(index, 0, midiNotes.length - 1);
    let midi = midiNotes[index];

    if (playing) {
      osc.freq(midiToFreq(midi), 0.1);
      osc.amp(0.15 * ampMult, 0.1);
    }

    stroke(255);
    strokeWeight(12);  
    fill(0);
    textSize(18);
    text("Please click without dragging thank you :(", 20, 40);
    textSize(12);
    strokeWeight(2);  
    text(`Press:`, 20, 65);
    text(`Z for Sine`, 20, 80);
    text(`X for Triangle`, 20, 95);
    text(`C for Square`, 20, 110);
    text(`V for Sawtooth`, 20, 125);

    strokeWeight(1);
    noFill();
    stroke(currentColor);
    rectMode(CENTER);
    square(mouseX, mouseY, 20);

    

    // Emit drawing and sound data
    let data = {
      x: mouseX,
      y: mouseY,
      color: currentColor,
      synth: currentWaveform, 
      midi: midi
    };
    socket.emit("update", data);
  }
}

function playOscillator() {
  osc.start(); playing = true;
}

function mouseReleased() {
  osc.amp(0, 0.13); playing = false;
}

function midiToNoteName(midi) {
  let noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  let note = noteNames[midi % 12];
  let octave = Math.floor(midi / 12) - 1;
  return note + octave;
}

function keyPressed() {
  if (key === 'z' || key === 'Z') { 
    osc.setType('sine'); ampMult=1; currentWaveform='sine'; currentColor='blue'; 
  }
  if (key === 'x' || key === 'X') { 
    osc.setType('triangle'); ampMult=1; currentWaveform='triangle'; currentColor='red'; 
  }
  if (key === 'c' || key === 'C') { 
    osc.setType('square'); ampMult=0.45; currentWaveform='square'; currentColor='green'; 
  }
  if (key === 'v' || key === 'V') { 
    osc.setType('sawtooth'); ampMult=0.7; currentWaveform='sawtooth'; currentColor='black'; 
  }
}

function onDrawData(data) {
  strokeWeight(1); noFill(); stroke(data.color); rectMode(CENTER);
  square(data.x, data.y, 20);

  // Optional: play sound for remote drawing
  let freq = midiToFreq(data.midi);
  let tempOsc = new p5.Oscillator(data.synth);
  tempOsc.start(); 
  tempOsc.freq(freq); 
  tempOsc.amp(0.01*ampMult, 0.1);
  // reverb.process(tempOsc, 3, 0.7); 
  tempOsc.stop(0.2);
}
