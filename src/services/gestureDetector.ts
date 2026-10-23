export type DetectedGesture = 'open_palm' | 'closed_fist' | 'none';

export interface GestureResult {
  gesture: DetectedGesture;
  confidence: number;
  label: string;
}

export class LocalHandGestureDetector {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private onResultCallback: ((result: GestureResult) => void) | null = null;
  private history: DetectedGesture[] = [];
  private sensitivity: number = 3; // 1-5

  constructor(sensitivity = 3) {
    this.sensitivity = sensitivity;
  }

  public setSensitivity(val: number) {
    this.sensitivity = Math.max(1, Math.min(5, val));
  }

  public start(videoElement: HTMLVideoElement, onResult: (res: GestureResult) => void) {
    this.video = videoElement;
    this.onResultCallback = onResult;

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 120;
      this.canvas.height = 90;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    this.isRunning = true;
    this.history = [];

    // Analyze every 50ms (~20 FPS) for instant responsiveness without CPU overload
    this.intervalId = window.setInterval(() => {
      this.processFrame();
    }, 50);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.video = null;
    this.history = [];
    if (this.onResultCallback) {
      this.onResultCallback({ gesture: 'none', confidence: 0, label: 'Camera Off' });
    }
  }

  private processFrame() {
    if (!this.isRunning || !this.video || !this.ctx || !this.canvas) return;
    if (this.video.readyState < 2) return;

    try {
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imgData.data;

      let skinPixels = 0;
      let minX = this.canvas.width;
      let maxX = 0;
      let minY = this.canvas.height;
      let maxY = 0;

      // Skin tone chromatic detector in RGB space
      // Rule: R > 95 && G > 40 && B > 20 && max-min > 15 && |R-G| > 15 && R > G && R > B
      for (let y = 0; y < this.canvas.height; y++) {
        for (let x = 0; x < this.canvas.width; x++) {
          const idx = (y * this.canvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const isSkin =
            r > 80 &&
            g > 35 &&
            b > 20 &&
            r > g &&
            r > b &&
            Math.abs(r - g) > 12 &&
            r - Math.min(g, b) > 15;

          if (isSkin) {
            skinPixels++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const totalPixels = this.canvas.width * this.canvas.height;
      const skinRatio = skinPixels / totalPixels;

      // Minimum hand threshold (~3% of frame)
      if (skinPixels < 350 || skinRatio < 0.03) {
        this.pushGesture('none', 0.9, 'Coast (No Hand)');
        return;
      }

      const bboxWidth = Math.max(1, maxX - minX);
      const bboxHeight = Math.max(1, maxY - minY);
      const bboxArea = bboxWidth * bboxHeight;
      const density = skinPixels / bboxArea;
      const aspectRatio = bboxHeight / bboxWidth;

      // Closed Fist: Compact blob, high density inside bounding box (> 0.58)
      // Open Palm: Fingers spread out, lower density (< 0.55), elongated fingers
      let detected: DetectedGesture = 'none';
      let confidence = 0.8;
      let label = 'Coast';

      // Sensitivity offsets
      const threshold = 0.54 + (this.sensitivity - 3) * 0.03;

      if (density >= threshold) {
        detected = 'closed_fist';
        confidence = Math.min(1, 0.7 + (density - threshold) * 1.5);
        label = 'BRAKE (Closed Fist)';
      } else {
        detected = 'open_palm';
        confidence = Math.min(1, 0.7 + (threshold - density) * 1.5);
        label = 'ACCELERATE (Open Palm)';
      }

      this.pushGesture(detected, confidence, label);
    } catch {
      // frame processing skipped
    }
  }

  private pushGesture(gesture: DetectedGesture, conf: number, label: string) {
    this.history.push(gesture);
    if (this.history.length > 3) this.history.shift();

    // 3-frame rolling majority voting debounce
    const counts = { open_palm: 0, closed_fist: 0, none: 0 };
    for (const g of this.history) {
      counts[g]++;
    }

    let finalGesture: DetectedGesture = gesture;
    if (counts.open_palm >= 2) finalGesture = 'open_palm';
    else if (counts.closed_fist >= 2) finalGesture = 'closed_fist';
    else if (counts.none >= 2) finalGesture = 'none';

    let displayLabel = label;
    if (finalGesture === 'open_palm') displayLabel = 'ACCELERATING (Open Palm)';
    else if (finalGesture === 'closed_fist') displayLabel = 'BRAKING (Closed Fist)';
    else displayLabel = 'COASTING (No Hand)';

    if (this.onResultCallback) {
      this.onResultCallback({
        gesture: finalGesture,
        confidence: conf,
        label: displayLabel,
      });
    }
  }
}
