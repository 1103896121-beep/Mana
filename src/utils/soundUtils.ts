
/**
 * V16 进阶音效系统 (Premium Soundscape)
 * 特性：移除所有突兀的电子点击声，仅保留 Web Audio API 合成的物理级“倒水注液”音效。
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

  // 合成更逼真的“涓流倒咖啡”声音
  private playPouringSound(duration: number, volume: number) {
    this.init();
    if (!this.audioCtx) return;

    const bufferSize = this.audioCtx.sampleRate * duration; 
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // 生成类布朗噪声/粉红噪声 (Pink/Brown-ish Noise)，比白噪声温和
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02; 
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // 带通滤波器 (Bandpass) 模拟杯腔共鸣
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 6; // 中高共鸣感
    
    // 倒入杯子随着水位上升，声音音调升高 (物理声学原理)
    filter.frequency.setValueAtTime(400, this.audioCtx.currentTime); 
    filter.frequency.exponentialRampToValueAtTime(1400, this.audioCtx.currentTime + duration);

    // 使用 LFO (低频振荡器) 调制音量，模拟水流断续与气泡声(trickling & bubbling)
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(18, this.audioCtx.currentTime); // 18次/秒的潺潺声
    const lfoGain = this.audioCtx.createGain();
    // 随时间减少调制幅度，即杯子快满时水流变平稳
    lfoGain.gain.setValueAtTime(1.5, this.audioCtx.currentTime);
    lfoGain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + duration);
    
    // 我们用 LFO 增强信号然后再放入原本的 gain
    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 0.1); 
    masterGain.gain.linearRampToValueAtTime(volume * 0.8, this.audioCtx.currentTime + duration - 0.2); 
    masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration); 

    // LFO -> masterGain 的音量控制 (模拟水流的颗粒感)
    const tremolo = this.audioCtx.createGain();
    tremolo.gain.value = 0.6; // 基础音量比例
    lfo.connect(lfoGain);
    lfoGain.connect(tremolo.gain);

    noiseSource.connect(filter);
    filter.connect(tremolo);
    tremolo.connect(masterGain);
    masterGain.connect(this.audioCtx.destination);

    noiseSource.start();
    lfo.start();
    lfo.stop(this.audioCtx.currentTime + duration);
  }

  // 任务创建：静音
  playCreate() {
    // 静音
  }

  // 任务完成：倒水声
  playComplete() {
    this.playPouringSound(1.5, 0.4); // 播放长达 1.5 秒的浑厚倒水声，对应水流注入玻璃杯的视觉阶段
  }

  // 任务删除：静音
  playDelete() {
    // 静音
  }
}

export const soundUtils = new SoundUtils();
