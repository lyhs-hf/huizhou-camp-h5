class SoundManager {
  enabled = false;
  private audio: HTMLAudioElement | null = null;
  setEnabled(value: boolean) {
    this.enabled = value;
    if (!value) this.stop();
  }
  async play(source?: string) {
    if (!this.enabled || !source) return;
    this.stop();
    this.audio = new Audio(source);
    this.audio.volume = 0.16;
    try {
      await this.audio.play();
    } catch {
      /* Silent fallback. */
    }
  }
  stop() {
    this.audio?.pause();
    this.audio = null;
  }
}
export const soundManager = new SoundManager();
