'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Move, Minimize2, Maximize2, Zap, Hand, ShieldCheck, AlertCircle } from 'lucide-react';
import { LocalHandGestureDetector, GestureResult, DetectedGesture } from '@/services/gestureDetector';

interface CameraPreviewProps {
  onGestureChange: (gesture: DetectedGesture) => void;
  isEnabled: boolean;
  onToggleCamera: (enabled: boolean) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  onGestureChange,
  isEnabled,
  onToggleCamera,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<LocalHandGestureDetector | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [gestureInfo, setGestureInfo] = useState<GestureResult>({
    gesture: 'none',
    confidence: 0,
    label: 'Camera Off',
  });
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [previewSize, setPreviewSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Default TOP-LEFT corner
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Clean stop all camera stream tracks
  const stopCameraStream = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.stop();
      detectorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onGestureChange('none');
    setGestureInfo({ gesture: 'none', confidence: 0, label: 'Camera Off' });
  }, [onGestureChange]);

  // Request & start camera
  const startCameraStream = useCallback(async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      const detector = new LocalHandGestureDetector(3);
      detectorRef.current = detector;

      // Start local optical recognition
      if (videoRef.current) {
        detector.start(videoRef.current, (result) => {
          setGestureInfo(result);
          onGestureChange(result.gesture);
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied or unavailable.';
      setPermissionError(msg);
      onToggleCamera(false);
      stopCameraStream();
    }
  }, [onGestureChange, onToggleCamera, stopCameraStream]);

  // Handle camera enabled prop toggle
  useEffect(() => {
    if (isEnabled) {
      startCameraStream();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isEnabled, startCameraStream, stopCameraStream]);

  // Dragging logic
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = Math.max(8, Math.min(window.innerWidth - 180, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(8, Math.min(window.innerHeight - 150, e.clientY - dragOffsetRef.current.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const sizeClasses = {
    small: 'w-32',
    medium: 'w-44',
    large: 'w-56',
  }[previewSize];

  if (!isEnabled) {
    return (
      <button
        onClick={() => onToggleCamera(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white font-mono text-xs transition-all shadow-md active:scale-95"
      >
        <Camera className="w-4 h-4 text-neo-lime" />
        <span>Enable Camera Gesture</span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 40,
        touchAction: 'none',
      }}
      className={`bg-neo-surface/95 backdrop-blur-md border border-neo-border rounded-2xl p-2.5 shadow-2xl transition-all cursor-move ${
        isDragging ? 'ring-2 ring-neo-lime shadow-neo-lime' : ''
      } ${isMinimized ? 'w-auto' : sizeClasses}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-neo-border/60">
        <div className="flex items-center gap-1.5 text-white text-[11px] font-mono font-bold">
          <Move className="w-3 h-3 text-neo-secondary" />
          <span className="hidden sm:inline">GESTURE CAM</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Size Cycle */}
          {!isMinimized && (
            <button
              onClick={() => {
                setPreviewSize((prev) => (prev === 'small' ? 'medium' : prev === 'medium' ? 'large' : 'small'));
              }}
              className="p-1 rounded bg-neo-bg hover:bg-neo-cardHover text-neo-secondary hover:text-white text-[10px] font-mono font-bold"
              title="Cycle Preview Size"
            >
              {previewSize[0].toUpperCase()}
            </button>
          )}

          {/* Minimize toggle */}
          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 rounded bg-neo-bg hover:bg-neo-cardHover text-neo-secondary hover:text-white"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>

          {/* Turn off camera */}
          <button
            onClick={() => onToggleCamera(false)}
            className="p-1 rounded bg-neo-bg hover:bg-neo-coral/20 text-neo-coral"
            title="Disable Camera"
          >
            <CameraOff className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Video Preview Canvas */}
      {!isMinimized && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] mb-2 border border-neo-border">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {permissionError && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-2 text-center text-[10px] text-neo-coral font-mono">
              <AlertCircle className="w-4 h-4 mb-1" />
              <span>{permissionError}</span>
            </div>
          )}
        </div>
      )}

      {/* Real-time Gesture Telemetry Badge */}
      <div
        className={`px-2 py-1.5 rounded-xl font-mono text-[10px] font-bold text-center flex items-center justify-center gap-1.5 ${
          gestureInfo.gesture === 'open_palm'
            ? 'bg-neo-lime text-slate-950 shadow-neo-lime'
            : gestureInfo.gesture === 'closed_fist'
            ? 'bg-neo-coral text-white shadow-neo-coral'
            : 'bg-neo-bg text-neo-secondary border border-neo-border'
        }`}
      >
        <Hand className="w-3.5 h-3.5" />
        <span className="truncate">{gestureInfo.label}</span>
      </div>
    </div>
  );
};
