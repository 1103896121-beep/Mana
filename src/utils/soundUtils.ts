class SoundUtils {
  private audioCtx: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isLoaded = false;

  constructor() {
    // Attempt pre-load as soon as class is instantiated
    if (typeof window !== 'undefined') {
      setTimeout(() => this.init(), 100);
    }
  }

  public init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.loadAudio();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private async loadAudio() {
    if (this.isLoaded || !this.audioCtx) return;
    try {
      const response = await fetch('/sounds/pouring-coffee.m4a');
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      this.isLoaded = true;
    } catch (e) {
      console.warn("Failed to load coffee recording:", e);
    }
  }

  public playCreate() {
    // Silent for task creation
  }

  // Task completed: Liquid pouring sound with dynamic resonance
  public playComplete(level: number = 0) {
    try {
      this.init();
      if (!this.audioCtx) return;

      const t = this.audioCtx.currentTime;

      if (this.audioBuffer) {
        // -- Real Recording Playback --
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.audioBuffer;

        // 1. Base Gain for softness
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.45, t); // Softer base volume
        
        // 2. Softness Filter: Remove harsh high frequencies
        const softFilter = this.audioCtx.createBiquadFilter();
        softFilter.type = 'lowpass';
        softFilter.frequency.setValueAtTime(3200, t);
        softFilter.Q.setValueAtTime(0.7, t);

        // 3. Dynamic Filling Resonance:
        // Lower level (empty) -> lower frequency resonance (deep)
        // Higher level (full) -> higher frequency resonance (tight/splashy)
        const fillFilter = this.audioCtx.createBiquadFilter();
        fillFilter.type = 'peaking';
        const startFreq = 350 + (level * 8); // 350Hz (empty) to 1150Hz (full)
        fillFilter.frequency.setValueAtTime(startFreq, t);
        fillFilter.frequency.exponentialRampToValueAtTime(startFreq + 150, t + 3.0);
        fillFilter.Q.setValueAtTime(5, t);
        fillFilter.gain.setValueAtTime(10, t); // Strong resonance

        // Fade out at 3s to ensure strictly 3s duration
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

        // Routing: source -> softFilter -> fillFilter -> gainNode -> destination
        source.connect(softFilter);
        softFilter.connect(fillFilter);
        fillFilter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        source.start(t);
        source.stop(t + 3.0);
        return;
      }
    } catch (e) {
      console.warn("Coffee pour sound failed: ", e);
    }
  }

  public playDelete() {
    // Keep silent for deletion
  }
}

export const soundUtils = new SoundUtils();
export default soundUtils;
