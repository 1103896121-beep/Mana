class SoundUtils {
  private audioCtx: AudioContext | null = null;

  constructor() {
    // Attempt pre-load as soon as class is instantiated
    if (typeof window !== 'undefined') {
      setTimeout(() => this.init(), 100);
    }
  }

  public init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }


  public playCreate() {
    // Silent for task creation
  }

  // 咕咚咕咚冒泡声 (模拟能量注入)
  public playBubbling() {
    this.init();
    if (!this.audioCtx) return;
    
    const now = this.audioCtx.currentTime;
    const duration = 2.5; // 冒泡持续时间
    
    // Create a master gain node for the bubbling sound to control its overall volume
    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.4, now); // Lowered from 1.0 for better comfort
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // Shorter fade
    masterGain.connect(this.audioCtx.destination);

    // Create multiple overlapping bubble sounds
    for (let i = 0; i < 15; i++) {
      const startTime = now + i * 0.15;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      // Low-frequency noise to simulate water flow/bubbles
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120 + Math.random() * 80, startTime);
      osc.frequency.exponentialRampToValueAtTime(300 + Math.random() * 200, startTime + 0.1);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.connect(gain);
      gain.connect(masterGain); // Connect to the bubbling master gain
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }

    // Fade out the master gain for the bubbling sound
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  }

  public playDelete() {
    // Keep silent for deletion
  }
}

export const soundUtils = new SoundUtils();
export default soundUtils;
