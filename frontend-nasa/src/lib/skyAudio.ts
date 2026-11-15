import type { WeatherPreset } from './liveWeather';

// Web Audio API Ambient Weather Synthesizer
// Pure client-side procedural sound generation inspired by Sky Studyo ASMR ambient audio mode

class SkyAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: Array<AudioNode> = [];
  private isMuted: boolean = true;
  private currentType: WeatherPreset = 'midday';

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private stopActiveNodes() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped nodes
      }
    });
    this.activeNodes = [];
  }

  public setSoundType(type: WeatherPreset) {
    this.currentType = type;
    if (!this.isMuted) {
      this.playCurrentType();
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopActiveNodes();
    } else {
      this.playCurrentType();
    }
    return !this.isMuted;
  }

  public getIsPlaying(): boolean {
    return !this.isMuted;
  }

  private playCurrentType() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.stopActiveNodes();

    const now = this.ctx.currentTime;

    if (this.currentType === 'storm') {
      // Pink/Brown noise generator for continuous rain shower
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.05) * 0.18;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.6);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start(now);
      this.activeNodes.push(whiteNoise, filter, gain);
    } else {
      // Midday, Dawn, Golden: Peaceful gentle atmospheric wind
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 1.2;
      }

      const windNoise = this.ctx.createBufferSource();
      windNoise.buffer = noiseBuffer;
      windNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const cutoffFreq = this.currentType === 'dawn' ? 320 : this.currentType === 'golden' ? 280 : 450;
      filter.frequency.setValueAtTime(cutoffFreq, now);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.7);

      windNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      windNoise.start(now);
      this.activeNodes.push(windNoise, filter, gain);
    }
  }

  public stopWeatherSound() {
    this.isMuted = true;
    this.stopActiveNodes();
  }

  public dispose() {
    this.stopActiveNodes();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const skyAudio = new SkyAudioManager();
