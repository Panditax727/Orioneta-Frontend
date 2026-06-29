const AudioCtx = window.AudioContext || window.webkitAudioContext;

let sharedCtx = null;

function ctx() {
  if (!AudioCtx) return null;
  if (!sharedCtx) {
    try {
      sharedCtx = new AudioCtx();
    } catch {
      return null;
    }
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function unlock() {
  const c = ctx();
  if (!c || c.state !== "suspended") return;
  c.resume().then(() => {
    document.removeEventListener("click", unlock);
    document.removeEventListener("touchstart", unlock);
    document.removeEventListener("keydown", unlock);
  }).catch(() => {});
}

document.addEventListener("click", unlock);
document.addEventListener("touchstart", unlock);
document.addEventListener("keydown", unlock);

function tone(freq, duration, volume, type) {
  const c = ctx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume || 0.1, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration + 0.01);
  } catch {}
}

export function playNotificationSound() {
  tone(880, 0.08, 0.08, "sine");
  setTimeout(() => tone(660, 0.1, 0.08, "sine"), 90);
}

export function startCallRingtone() {
  let running = true;
  let timeout = null;

  function playChord() {
    if (!running) return;
    const c = ctx();
    if (!c) return;
    try {
      const now = c.currentTime;
      const osc1 = c.createOscillator();
      const osc2 = c.createOscillator();
      const gain = c.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(c.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659, now);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(523, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.start(now);
      osc1.stop(now + 0.28);
      osc2.start(now);
      osc2.stop(now + 0.28);
    } catch {}
    timeout = setTimeout(playNotes, 350);
  }

  function playNotes() {
    if (!running) return;
    tone(523, 0.2, 0.08, "sine");
    setTimeout(() => tone(659, 0.2, 0.08, "triangle"), 200);
    setTimeout(() => tone(784, 0.25, 0.08, "sine"), 420);
    timeout = setTimeout(playChord, 850);
  }

  timeout = setTimeout(playChord, 100);

  return () => {
    running = false;
    if (timeout) clearTimeout(timeout);
  };
}
