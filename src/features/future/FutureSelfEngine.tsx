'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Download,
  Sparkles,
  Cpu,
  Rocket,
  Zap,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  Loader2,
} from 'lucide-react';
import { FUTURE_HORIZONS } from './futurePresets';
import { FutureHorizonId, FutureHorizonOption } from './futureTypes';

export const FutureSelfEngine: React.FC = () => {
  // Image & Camera States
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedHorizonId, setSelectedHorizonId] = useState<FutureHorizonId>('future-10');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [, setIsProcessing] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Camera stream management
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentHorizon =
    FUTURE_HORIZONS.find((h) => h.id === selectedHorizonId) || FUTURE_HORIZONS[0];

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraError(null);
    setIsCameraLoading(false);
  }, []);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Keep video element attached to active stream
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
    }
  }, [cameraActive]);

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraLoading(true);

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported in this browser environment. Please upload an image file.');
      }

      let stream: MediaStream;
      try {
        // Try with requested facing mode and resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e) {
        console.warn('Initial camera constraints failed, attempting fallback to basic video:', e);
        // Fallback to basic video without restrictive constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      // Attach stream immediately to video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.warn);
        };
        await videoRef.current.play().catch(console.warn);
      }

      setCameraActive(true);
      setIsCameraLoading(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraLoading(false);
      setCameraActive(false);

      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was denied. Please allow camera permissions in your browser bar (look for the lock or camera icon), or upload a photo directly.'
        );
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on your system. Please upload a photo instead.');
      } else {
        setCameraError(
          err?.message || 'Camera is currently unavailable. Please upload a portrait photo to test the simulator.'
        );
      }
    }
  };

  // Flip camera between front and rear
  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (cameraActive) {
      stopCamera();
      // Restart with new facing mode
      setTimeout(() => {
        setCameraFacing(nextFacing);
        startCamera();
      }, 20);
    }
  };

  // Capture snapshot from live video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth || 640;
    captureCanvas.height = video.videoHeight || 640;
    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;

    if (cameraFacing === 'user') {
      ctx.translate(captureCanvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    const photoDataUrl = captureCanvas.toDataURL('image/jpeg', 0.95);

    setSourceImage(photoDataUrl);
    stopCamera();
  };

  // Trigger countdown then snap
  const triggerCountdownCapture = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  // Handle uploaded photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setSourceImage(event.target.result);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  // Core Canvas Transformation Engine (Zero artificial delay)
  const renderFutureSelf = useCallback(
    (srcDataUrl: string, horizon: FutureHorizonOption) => {
      setIsProcessing(true);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const size = 800;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Draw source image scaled to square crop
        const imgAspect = img.width / img.height;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;
        if (imgAspect > 1) {
          sw = img.height;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

        // Horizon-specific pixel manipulation & tinting
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const avg = (r + g + b) / 3;

          switch (horizon.id) {
            case 'future-10': {
              const contrast = 1.15;
              data[i] = Math.min(255, Math.max(0, (r - 128) * contrast + 128 - 6));
              data[i + 1] = Math.min(255, Math.max(0, (g - 128) * contrast + 128 + 2));
              data[i + 2] = Math.min(255, Math.max(0, (b - 128) * contrast + 128 + 14));
              break;
            }
            case 'future-25': {
              const silverMix = avg * 0.35;
              data[i] = Math.min(255, r * 0.75 + silverMix);
              data[i + 1] = Math.min(255, g * 0.75 + silverMix + 4);
              data[i + 2] = Math.min(255, b * 0.82 + silverMix + 18);
              break;
            }
            case 'cybernetic': {
              data[i] = Math.min(255, r * 0.65);
              data[i + 1] = Math.min(255, g * 0.95 + 15);
              data[i + 2] = Math.min(255, b * 1.15 + 35);
              break;
            }
            case 'mars-pioneer': {
              data[i] = Math.min(255, r * 1.25 + 30);
              data[i + 1] = Math.min(255, g * 0.92 + 10);
              data[i + 2] = Math.min(255, b * 0.7 - 10);
              break;
            }
            case 'elysium': {
              data[i] = Math.min(255, r * 1.15 + 28);
              data[i + 1] = Math.min(255, g * 0.8);
              data[i + 2] = Math.min(255, b * 1.25 + 35);
              break;
            }
            case 'grand-elder': {
              const warmSilver = avg * 0.45;
              data[i] = Math.min(255, r * 0.68 + warmSilver + 22);
              data[i + 1] = Math.min(255, g * 0.68 + warmSilver + 14);
              data[i + 2] = Math.min(255, b * 0.68 + warmSilver);
              break;
            }
          }
        }
        ctx.putImageData(imageData, 0, 0);

        // Layered Procedural Effects & Horizon Overlays
        ctx.save();

        if (horizon.id === 'future-10') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(size / 2, size * 0.42, size * 0.28, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(20, 25, 45, 0.25)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(size * 0.35, size * 0.39);
          ctx.lineTo(size * 0.31, size * 0.38);
          ctx.moveTo(size * 0.65, size * 0.39);
          ctx.lineTo(size * 0.69, size * 0.38);
          ctx.stroke();
        }

        if (horizon.id === 'future-25') {
          const grad = ctx.createRadialGradient(
            size / 2,
            size * 0.3,
            size * 0.2,
            size / 2,
            size * 0.3,
            size * 0.5
          );
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.7, 'rgba(226, 232, 240, 0.2)');
          grad.addColorStop(1, 'rgba(167, 139, 250, 0.35)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, size, size);

          ctx.strokeStyle = 'rgba(30, 20, 50, 0.35)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(size * 0.42, size * 0.32);
          ctx.lineTo(size * 0.58, size * 0.32);
          ctx.moveTo(size * 0.38, size * 0.52);
          ctx.lineTo(size * 0.41, size * 0.58);
          ctx.moveTo(size * 0.62, size * 0.52);
          ctx.lineTo(size * 0.59, size * 0.58);
          ctx.stroke();
        }

        if (horizon.id === 'cybernetic') {
          const eyeX = size * 0.61;
          const eyeY = size * 0.42;

          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 24;
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 32, 0, Math.PI * 2);
          ctx.stroke();

          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 48, -0.4, 3.5);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(eyeX - 58, eyeY);
          ctx.lineTo(eyeX - 38, eyeY);
          ctx.moveTo(eyeX + 38, eyeY);
          ctx.lineTo(eyeX + 58, eyeY);
          ctx.moveTo(eyeX, eyeY - 58);
          ctx.lineTo(eyeX, eyeY - 38);
          ctx.moveTo(eyeX, eyeY + 38);
          ctx.lineTo(eyeX, eyeY + 58);
          ctx.stroke();

          ctx.shadowBlur = 12;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(eyeX + 48, eyeY - 20);
          ctx.lineTo(eyeX + 85, eyeY - 45);
          ctx.lineTo(eyeX + 130, eyeY - 45);
          ctx.lineTo(eyeX + 155, eyeY - 80);

          ctx.moveTo(eyeX + 48, eyeY + 15);
          ctx.lineTo(eyeX + 90, eyeY + 35);
          ctx.lineTo(eyeX + 140, eyeY + 35);
          ctx.stroke();

          ctx.fillStyle = '#00F0FF';
          ctx.beginPath();
          ctx.arc(eyeX + 130, eyeY - 45, 4, 0, Math.PI * 2);
          ctx.arc(eyeX + 140, eyeY + 35, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#00F0FF';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('NEURAL-LINK [V7.4.2] ACTIVE', eyeX - 60, eyeY + 70);
          ctx.fillText('OCULAR DIOPTER: +2.85 GHz', eyeX - 60, eyeY + 84);
        }

        if (horizon.id === 'mars-pioneer') {
          const helmGrad = ctx.createLinearGradient(0, 0, size, size);
          helmGrad.addColorStop(0, 'rgba(251, 146, 60, 0.2)');
          helmGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.05)');
          helmGrad.addColorStop(1, 'rgba(239, 68, 68, 0.25)');
          ctx.fillStyle = helmGrad;
          ctx.fillRect(0, 0, size, size);

          ctx.strokeStyle = 'rgba(254, 215, 170, 0.35)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(size / 2, size * 0.45, size * 0.44, Math.PI * 0.85, Math.PI * 1.45);
          ctx.stroke();

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(size * 0.05, size * 0.05, 230, 48);
          ctx.strokeStyle = '#FB923C';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(size * 0.05, size * 0.05, 230, 48);
          ctx.fillStyle = '#FB923C';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('VALLES MARINERIS // HAB-04', size * 0.07, size * 0.08);
          ctx.fillStyle = '#FED7AA';
          ctx.font = '10px monospace';
          ctx.fillText('O2 MIX: 98.4% | RAD-LVL: NOMINAL', size * 0.07, size * 0.098);
        }

        if (horizon.id === 'elysium') {
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
          ctx.lineWidth = 1;
          for (let y = 0; y < size; y += 16) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
          }

          ctx.fillStyle = '#EC4899';
          ctx.shadowColor = '#F472B6';
          ctx.shadowBlur = 10;
          for (let p = 0; p < 24; p++) {
            const px = (p * 79 + 31) % size;
            const py = (p * 97 + 53) % size;
            ctx.beginPath();
            ctx.arc(px, py, (p % 3) + 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (horizon.id === 'grand-elder') {
          const elderGrad = ctx.createRadialGradient(
            size / 2,
            size / 2,
            size * 0.25,
            size / 2,
            size / 2,
            size * 0.6
          );
          elderGrad.addColorStop(0, 'rgba(251, 191, 36, 0.04)');
          elderGrad.addColorStop(0.7, 'rgba(180, 83, 9, 0.12)');
          elderGrad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
          ctx.fillStyle = elderGrad;
          ctx.fillRect(0, 0, size, size);

          ctx.strokeStyle = 'rgba(74, 30, 5, 0.4)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(size * 0.32, size * 0.26);
          ctx.lineTo(size * 0.68, size * 0.26);
          ctx.moveTo(size * 0.36, size * 0.30);
          ctx.lineTo(size * 0.64, size * 0.30);
          ctx.stroke();
        }

        // Sleek Futuristic Bottom Telemetry Passcard Bar
        const barH = 54;
        ctx.fillStyle = 'rgba(9, 10, 15, 0.92)';
        ctx.fillRect(0, size - barH, size, barH);
        ctx.strokeStyle = horizon.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, size - barH);
        ctx.lineTo(size, size - barH);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`AFTERHOURS // TEMPORAL HORIZON: ${horizon.year}`, 20, size - 30);

        ctx.fillStyle = horizon.accentColor;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(
          `BIOMETRIC ID: AH-${Math.floor(Math.random() * 89999 + 10000)} • ${horizon.badge}`,
          20,
          size - 14
        );

        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px monospace';
        ctx.fillText('VERIFIED TEMPORAL PROJECTION', size - 210, size - 22);

        ctx.restore();

        const resultUrl = canvas.toDataURL('image/png', 0.95);
        setGeneratedImage(resultUrl);
        setIsProcessing(false);
      };
      img.src = srcDataUrl;
    },
    []
  );

  // Trigger re-render whenever source image or horizon changes
  useEffect(() => {
    if (sourceImage) {
      renderFutureSelf(sourceImage, currentHorizon);
    }
  }, [sourceImage, currentHorizon, renderFutureSelf]);

  // Download high-res passcard
  const downloadResult = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `afterhours-future-self-${currentHorizon.year}.png`;
    link.href = generatedImage;
    link.click();
  };

  // Render horizon icon
  const renderHorizonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4" />;
      case 'Rocket':
        return <Rocket className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Clock':
        return <Clock className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* PHASE 1: NO IMAGE CAPTURED YET */}
      {!sourceImage && (
        <div className="w-full max-w-2xl mx-auto bg-[#0E1322] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25">
              <Camera className="w-3.5 h-3.5" />
              CAMERA & PHOTO INPUT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Capture or Upload Your Photo
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-md mx-auto">
              Snap a live selfie with your camera or upload any portrait photo to see how you will look 10 years, 25 years into the future, or augmented with cybernetics.
            </p>
          </div>

          {/* Unified Camera/Standby Viewport */}
          <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl bg-[#090D18] border-2 border-dashed border-[#334155] overflow-hidden flex flex-col items-center justify-center">
            {/* The video element is ALWAYS mounted in the DOM to avoid React ref-null race conditions */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                cameraActive ? (cameraFacing === 'user' ? 'scale-x-[-1]' : '') : 'hidden'
              }`}
            />

            {/* Overlays when camera is active */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                {/* Oval face guide */}
                <div className="w-56 h-72 border-2 border-[#00F0FF]/60 rounded-[48%] relative shadow-[0_0_24px_rgba(0,240,255,0.3)]">
                  {/* Corner Target Marks */}
                  <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-[#00F0FF]" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-[#00F0FF]" />
                  <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-[#00F0FF]" />
                  <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-[#00F0FF]" />

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest text-[#00F0FF]/80 uppercase bg-[#090D18]/80 px-2 py-0.5 rounded">
                    ALIGN FACE HERE
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#00F0FF] bg-[#090D18]/80 px-3 py-1.5 rounded-lg border border-[#00F0FF]/30 backdrop-blur-sm">
                  <span>CAMERA ACTIVE</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                    LIVE
                  </span>
                </div>
              </div>
            )}

            {/* Countdown overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-7xl font-black text-[#00F0FF] animate-bounce">
                  {countdown}
                </div>
              </div>
            )}

            {/* Standby UI (when camera not active) */}
            {!cameraActive && (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#38BDF8] mb-4 shadow-lg">
                  {isCameraLoading ? (
                    <Loader2 className="w-9 h-9 animate-spin text-[#00F0FF]" />
                  ) : (
                    <Camera className="w-9 h-9" />
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {isCameraLoading ? 'Connecting to Camera...' : 'Camera Standby'}
                </h3>
                <p className="text-xs text-[#94A3B8] max-w-xs mb-6">
                  Click &apos;Start Camera&apos; to use your webcam, or select a photo from your device.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={startCamera}
                    disabled={isCameraLoading}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white font-bold text-sm shadow-[0_0_20px_rgba(0,102,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isCameraLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <span>{isCameraLoading ? 'Starting...' : 'Start Camera'}</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white font-medium text-sm border border-[#475569] active:scale-95 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Camera Action Controls */}
          {cameraActive && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={capturePhoto}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-white font-bold text-sm shadow-[0_0_24px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
              <button
                onClick={triggerCountdownCapture}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white font-semibold text-xs border border-[#475569] active:scale-95 transition-all cursor-pointer"
              >
                <span>3s Timer</span>
              </button>
              <button
                onClick={toggleCameraFacing}
                className="p-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white border border-[#475569] transition-all cursor-pointer"
                title="Switch Camera (Front/Rear)"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 font-semibold text-xs border border-red-800/40 transition-all cursor-pointer"
              >
                Stop Camera
              </button>
            </div>
          )}

          {/* Camera Error banner with direct Upload solution */}
          {cameraError && (
            <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{cameraError}</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 font-bold text-xs hover:brightness-110 transition-all cursor-pointer"
              >
                Choose Photo
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: PHOTO CAPTURED & VISUALIZER ACTIVE */}
      {sourceImage && (
        <div className="space-y-6">
          {/* Top Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1322] border border-[#1E293B] p-4 sm:p-5 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#00F0FF] flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase">
                  SIMULATION ACTIVE
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {currentHorizon.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSourceImage(null);
                  setGeneratedImage(null);
                  startCamera();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-semibold border border-[#475569] active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Photo</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-semibold border border-[#475569] active:scale-95 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <button
                onClick={downloadResult}
                disabled={!generatedImage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Passcard</span>
              </button>
            </div>
          </div>

          {/* Temporal Horizon Selector Options */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h3 className="text-xs font-bold tracking-wide uppercase text-[#94A3B8] font-mono">
                Select Horizon ({FUTURE_HORIZONS.length} Options)
              </h3>
              <span className="text-xs text-[#38BDF8]">Instant Render</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {FUTURE_HORIZONS.map((h) => {
                const isSelected = h.id === selectedHorizonId;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHorizonId(h.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between group active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#131D38] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.25)] ring-1 ring-[#00F0FF]'
                        : 'bg-[#0E1322] border-[#1E293B] hover:border-[#38BDF8]/60 hover:bg-[#12192E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: h.accentColor }}
                        >
                          {renderHorizonIcon(h.iconName)}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                          {h.year}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#38BDF8] transition-colors">
                        {h.title}
                      </h4>
                      <p className="text-[10px] text-[#64748B] line-clamp-2 mt-0.5">
                        {h.tagline}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#1E293B] flex items-center justify-between">
                      <span
                        className="text-[9px] font-mono font-bold"
                        style={{ color: h.accentColor }}
                      >
                        {h.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Split Comparison Viewport & Telemetry HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Split Comparison Viewport (7 cols) */}
            <div className="lg:col-span-7 bg-[#0E1322] border border-[#1E293B] rounded-3xl p-5 shadow-2xl relative">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-mono text-slate-400">
                  DRAG SLIDER TO COMPARE
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#38BDF8]">ORIGINAL (0%)</span>
                  <span className="text-slate-600">|</span>
                  <span style={{ color: currentHorizon.accentColor }}>
                    FUTURE ({currentHorizon.year})
                  </span>
                </div>
              </div>

              {/* Slider Viewport Container */}
              <div className="relative aspect-square w-full max-w-lg mx-auto rounded-2xl overflow-hidden border-2 border-[#1E293B] select-none bg-black">
                {/* Transformed Future Self (Base Layer) */}
                {generatedImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={generatedImage}
                    alt={`Future Self ${currentHorizon.year}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Original Photo (Clipped Overlay Layer) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sourceImage}
                    alt="Original Photo"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-mono text-white">
                    ORIGINAL
                  </div>
                </div>

                <div
                  className="absolute top-3 right-3 px-2 py-0.5 rounded backdrop-blur-sm border text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: 'rgba(9,10,15,0.75)',
                    borderColor: currentHorizon.accentColor,
                    color: currentHorizon.accentColor,
                  }}
                >
                  {currentHorizon.title.toUpperCase()}
                </div>

                {/* Vertical Divider Line with Grab Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] cursor-ew-resize z-10"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl font-bold text-xs pointer-events-none">
                    ⇄
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize z-20 w-full h-full"
                  title="Drag left/right to compare"
                />
              </div>

              {/* Slider Track */}
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="flex-1 accent-[#00F0FF] cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-white w-10 text-right">
                  {sliderPosition}%
                </span>
              </div>
            </div>

            {/* Horizon Dossier (5 cols) */}
            <div className="lg:col-span-5 bg-[#0E1322] border border-[#1E293B] rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentHorizon.accentColor }}
                />
                <h3 className="text-sm font-bold text-white">
                  Horizon Telemetry Dossier
                </h3>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {currentHorizon.description}
              </p>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E293B] flex items-center justify-between">
                  <span className="text-slate-400">AGE SHIFT:</span>
                  <span className="font-bold text-white">
                    +{currentHorizon.telemetry.ageOffset} Years
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E293B] flex items-center justify-between">
                  <span className="text-slate-400">CELLULAR STATUS:</span>
                  <span
                    className="font-bold"
                    style={{ color: currentHorizon.accentColor }}
                  >
                    {currentHorizon.telemetry.cellularMaturation}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E293B] flex items-center justify-between">
                  <span className="text-slate-400">AUGMENTATION:</span>
                  <span className="font-bold text-white">
                    {currentHorizon.telemetry.cyberAugmentation}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E293B] flex items-center justify-between">
                  <span className="text-slate-400">ENVIRONMENT:</span>
                  <span className="font-bold text-slate-200">
                    {currentHorizon.telemetry.environment}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Keep your generated image:
                </span>
                <button
                  onClick={downloadResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: currentHorizon.accentColor }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
