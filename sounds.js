(function () {
  let audio = null;
  function getAudio() {
    if (!audio) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audio = new AudioCtx();
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  function tone(start, end, duration, type) {
    const ctx = getAudio();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(start, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  function flap() {
    try { tone(240, 420, 0.12, 'sine'); } catch (error) {}
  }

  function score() {
    try { tone(620, 980, 0.16, 'sine'); } catch (error) {}
  }

  function crash() {
    try { tone(180, 70, 0.28, 'triangle'); } catch (error) {}
  }

  window.SOUNDS = { flap, score, crash };
})();
