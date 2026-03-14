
/**
 * V16 精调音效系统
 * 特性：时长缩短（灵敏度高），整体音调下潜（更稳重低沉）
 */

class SoundUtils {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private playRisingTone(startFreq: number, endFreq: number, duration: number, volume: number) {
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // 音调下潜且路径缩短
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    // 渐弱效果加速
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  // 任务创建：干脆的低音上升
  playCreate() {
    this.playRisingTone(80.0, 220.0, 0.5, 0.08); 
  }

  // 任务完成：稳重的较长上升（比之前短）
  playComplete() {
    this.playRisingTone(60.0, 329.6, 0.8, 0.1); 
  }

  // 任务删除：极低频短音
  playDelete() {
    this.playRisingTone(40.0, 110.0, 0.6, 0.08); 
  }
}

export const soundUtils = new SoundUtils();
