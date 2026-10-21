/**
 * Web Audio API Engine for peaceful Islamic prayer chimes,
 * synthetic Adhan Takbeer melody, and tactile Tasbih clicks.
 * Operates 100% client-side with zero external network dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Tactile subtle click sound for Digital Masbaha / Tasbih tap
   */
  public playTasbihClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);

      // Trigger subtle haptic pulse if supported
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(20);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Completion celebration chime when a Dhikr target or Khatmah goal is reached
   */
  public playCompletionChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major triad)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.65);
      });

      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([40, 60, 40]);
      }
    } catch {
      // Audio autoplay fallback
    }
  }

  /**
   * Serene prayer chime tone for prayer notification alert
   */
  public playPrayerAlert(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5 (warm serene chord)
      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2.3);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Melodic Adhan Takbeer synthesis:
   * Peaceful modal tones evoking the opening sequence of the Adhan:
   * "Allahu Akbar, Allahu Akbar"
   */
  public playAdhanTakbeer(onComplete?: () => void): void {
    const ctx = this.getContext();
    if (!ctx) {
      if (onComplete) onComplete();
      return;
    }

    try {
      // Melodic notes in Hijaz / Bayati scale for opening takbeer
      // [freq, duration, pause]
      const notes: Array<[number, number]> = [
        [329.63, 0.7],  // E4 "Al-"
        [392.00, 0.9],  // G4 "-laa-"
        [369.99, 1.2],  // F#4 "-hu"
        [329.63, 1.4],  // E4 "Ak-bar"
        // Brief pause
        [392.00, 0.8],  // G4 "Al-"
        [440.00, 1.0],  // A4 "-laa-"
        [392.00, 1.1],  // G4 "-hu"
        [329.63, 1.8],  // E4 "Ak-bar"
      ];

      let startTime = ctx.currentTime + 0.05;

      notes.forEach(([freq, dur], idx) => {
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gain = ctx.createGain();

        // Fundamental tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Warm harmonic overtone
        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

        // Vocal-like soft attack and warm decay
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.04, startTime);

        osc.connect(gain);
        oscHarmonic.connect(subGain);
        subGain.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        oscHarmonic.start(startTime);
        osc.stop(startTime + dur + 0.05);
        oscHarmonic.stop(startTime + dur + 0.05);

        startTime += dur + (idx === 3 ? 0.4 : 0.08);
      });

      const totalDurationMs = (startTime - ctx.currentTime) * 1000;
      if (onComplete) {
        setTimeout(onComplete, totalDurationMs);
      }
    } catch {
      if (onComplete) onComplete();
    }
  }
}

export const audioEngine = new SoundEngine();
