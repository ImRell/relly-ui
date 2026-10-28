import { SoundPack } from '../types';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 1.0;
  private soundPack: SoundPack = 'synth';

  constructor(enabled: boolean = true, soundPack: SoundPack = 'synth') {
    this.enabled = enabled;
    this.soundPack = soundPack;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setSoundPack(pack: SoundPack): this {
    this.soundPack = pack;
    return this;
  }

  public getSoundPack(): SoundPack {
    return this.soundPack;
  }

  private initCtx(): AudioContext | null {
    if (!this.enabled || this.volume <= 0 || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playClick(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (this.soundPack === 'mechanical') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.012);
        gain.gain.setValueAtTime(0.06 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.013);
      } else if (this.soundPack === 'bubble') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1250, now + 0.022);
        gain.gain.setValueAtTime(0.045 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.024);
      } else if (this.soundPack === 'arcade') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.01);
        gain.gain.setValueAtTime(0.028 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.022);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.015);
        gain.gain.setValueAtTime(0.04 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.016);
      }
    } catch {
      // Audio context error or blocked
    }
  }

  public playToggle(state: boolean): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (this.soundPack === 'mechanical') {
        osc.type = 'triangle';
        const startFreq = state ? 2800 : 1800;
        const endFreq = state ? 900 : 400;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.018);
        gain.gain.setValueAtTime(0.055 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      } else if (this.soundPack === 'bubble') {
        osc.type = 'sine';
        const startFreq = state ? 380 : 900;
        const endFreq = state ? 1100 : 280;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.028);
        gain.gain.setValueAtTime(0.045 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (this.soundPack === 'arcade') {
        osc.type = 'square';
        const f1 = state ? 523.25 : 659.25;
        const f2 = state ? 783.99 : 392.0;
        osc.frequency.setValueAtTime(f1, now);
        osc.frequency.setValueAtTime(f2, now + 0.015);
        gain.gain.setValueAtTime(0.025 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.032);
      } else {
        osc.type = 'triangle';
        const freq = state ? 650 : 450;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.1, now + 0.025);
        gain.gain.setValueAtTime(0.035 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.026);
      }
    } catch {
      // Ignore
    }
  }

  public playNotify(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (this.soundPack === 'arcade') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.04);
        osc.frequency.setValueAtTime(783.99, now + 0.08);
        osc.frequency.setValueAtTime(1046.50, now + 0.12);
        gain.gain.setValueAtTime(0.03 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      } else if (this.soundPack === 'bubble') {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, now);
        osc1.frequency.exponentialRampToValueAtTime(950, now + 0.05);
        gain1.gain.setValueAtTime(0.04 * this.volume, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.06);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(550, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.11);
        gain2.gain.setValueAtTime(0.04 * this.volume, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.12);
      } else {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = this.soundPack === 'mechanical' ? 'triangle' : 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.04 * this.volume, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.07);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = this.soundPack === 'mechanical' ? 'triangle' : 'sine';
        osc2.frequency.setValueAtTime(783.99, now + 0.05);
        gain2.gain.setValueAtTime(0.04 * this.volume, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.13);
      }
    } catch {
      // Ignore
    }
  }

  public playSnap(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (this.soundPack === 'mechanical') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);
        gain.gain.setValueAtTime(0.06 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      } else if (this.soundPack === 'bubble') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.035);
        gain.gain.setValueAtTime(0.05 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      } else if (this.soundPack === 'arcade') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(110, now + 0.015);
        gain.gain.setValueAtTime(0.035 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);
        gain.gain.setValueAtTime(0.04 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.038);
    } catch {
      // Ignore
    }
  }

  public playMiniHud(isEntering: boolean = true): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = this.soundPack === 'arcade' ? 'square' : 'sine';
      const startFreq = isEntering ? 380 : 640;
      const endFreq = isEntering ? 680 : 340;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

      gain.gain.setValueAtTime(0.03 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Ignore
    }
  }

  public playTick(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (this.soundPack === 'mechanical') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.006);
        gain.gain.setValueAtTime(0.03 * this.volume, now);
      } else if (this.soundPack === 'bubble') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(1350, now + 0.01);
        gain.gain.setValueAtTime(0.02 * this.volume, now);
      } else if (this.soundPack === 'arcade') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1174.66, now);
        gain.gain.setValueAtTime(0.018 * this.volume, now);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.008);
        gain.gain.setValueAtTime(0.015 * this.volume, now);
      }

      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.01);
    } catch {
      // Ignore
    }
  }

  public playTab(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (this.soundPack === 'mechanical') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1900, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.014);
        gain.gain.setValueAtTime(0.045 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.016);
      } else if (this.soundPack === 'bubble') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.02);
        gain.gain.setValueAtTime(0.04 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.022);
      } else if (this.soundPack === 'arcade') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(659.25, now);
        gain.gain.setValueAtTime(0.025 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.018);
        gain.gain.setValueAtTime(0.03 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      }
    } catch {
      // Ignore
    }
  }
}
