/**
 * VESUVIO.EXE - Audio Engine
 * Polyphonic C-Major Pentatonic Synthesizer with soft ADSR envelopes
 */
"use strict";

let audioCtx = null;
const PENTATONIC_SCALE = [
  261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
  523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
  1046.50, 1174.66, 1318.51               // C6, D6, E6
];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, dur = 0.15, type = "sine", vol = 0.05, delay = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Rate limiter for immediate tones: bot swarms at high level fired
    // hundreds of oscillators per second; the audio graph itself became a
    // stutter source. Delayed (chord) tones always pass through.
    if (!delay) {
      const nowWall = performance.now();
      if (playTone._lastT >= 0 && nowWall - playTone._lastT < 30) return;
      playTone._lastT = nowWall;
    }
    
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    
    // Soft ADSR Envelope
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch (err) {
    // Audio context may be restricted by autoplay policy until user gesture
  }
}

function playChime(freq, vol = 0.04) {
  playTone(freq, 0.12, "sine", vol, 0);
  playTone(freq * 2, 0.08, "sine", vol * 0.35, 0.008);
}

// Sound effects catalog
const sClick = () => {
  const note = PENTATONIC_SCALE[Math.floor(Math.random() * PENTATONIC_SCALE.length)];
  playChime(note, 0.04);
};

const sHit = () => {
  const note = PENTATONIC_SCALE[Math.floor(Math.random() * 5) + 3];
  playTone(note, 0.07, "triangle", 0.035, 0);
};

const sCrit = () => {
  playTone(1046.5, 0.1, "sine", 0.06, 0);
  playTone(1318.5, 0.12, "triangle", 0.05, 0.03);
};

const sMultistrike = () => {
  playTone(783.99, 0.08, "triangle", 0.04, 0);
  playTone(1046.50, 0.08, "sine", 0.05, 0.04);
  playTone(1318.51, 0.1, "sine", 0.05, 0.08);
};

const sOvercharge = () => {
  [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    playTone(f, 0.18, "triangle", 0.06, i * 0.04);
  });
};

const sKill = () => {
  [523.25, 659.25, 783.99].forEach((f, i) => {
    playTone(f, 0.1, "sine", 0.045, i * 0.05);
  });
};

const sBossWarning = () => {
  playTone(146.83, 0.35, "sawtooth", 0.05, 0);
  playTone(130.81, 0.45, "sawtooth", 0.06, 0.15);
};

const sBossStrike = () => {
  playTone(180, 0.22, "sawtooth", 0.06, 0);
  playTone(120, 0.3, "sine", 0.07, 0.04);
};

const sBossDefeat = () => {
  [392, 523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
    playTone(f, 0.25, "sine", 0.065, i * 0.07);
  });
};

const sBuy = () => {
  playTone(659.25, 0.08, "sine", 0.05, 0);
  playTone(880.00, 0.12, "sine", 0.05, 0.06);
};

const sReroll = () => {
  playTone(587.33, 0.06, "triangle", 0.04, 0);
  playTone(783.99, 0.08, "triangle", 0.04, 0.05);
};

const sTicket = () => {
  [783.99, 880.00, 1046.50, 1318.51].forEach((f, i) => {
    playTone(f, 0.14, "sine", 0.05, i * 0.05);
  });
};

const sErr = () => {
  playTone(220.00, 0.15, "sine", 0.035, 0);
  playTone(174.61, 0.20, "sine", 0.035, 0.08);
};

const sWin = () => {
  [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
    playTone(f, 0.14, "sine", 0.05, i * 0.07);
  });
};

const sLevel = () => {
  [392.00, 523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
    playTone(f, 0.16, "triangle", 0.06, i * 0.06);
  });
};

const sLavaDrop = () => {
  playTone(880.00, 0.08, "sine", 0.045, 0);
  playTone(1174.66, 0.12, "sine", 0.055, 0.04);
};

// Generic fallback helper
function beep(f, dur, vol, type) {
  playTone(f, dur, type, vol, 0);
}
