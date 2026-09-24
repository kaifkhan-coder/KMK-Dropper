import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Upload, 
  Zap, 
  ZapOff, 
  SwitchCamera,
  CheckCircle2,
  FileText,
  Scan,
  Smartphone
} from 'lucide-react';
import jsQR from 'jsqr';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult?: (result: string) => void;
  currentPackageId?: string;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
  currentPackageId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  // Stop camera media tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Frame processing loop using jsQR
  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      const scannedData = code.data.trim();
      handleSuccessfulScan(scannedData);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  }, []);

  // Handle successful QR code decode
  const handleSuccessfulScan = (data: string) => {
    stopCamera();
    setScannedResult(data);

    // Audio / Haptic feedback if supported
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 30, 40]);
      }
    } catch {
      // ignore
    }

    if (onScanResult) {
      onScanResult(data);
    }
  };

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage('');
    setScannedResult(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Camera access is not supported in this browser. Please use the image upload option.');
      setHasCameraPermission(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check if torch/flashlight capability is present
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities ? (videoTrack.getCapabilities() as any) : {};
        setHasTorch(Boolean(capabilities?.torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setHasCameraPermission(true);
        animationFrameRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setHasCameraPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please allow camera permissions in your browser or upload a QR image.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera found on this device. You can upload a QR image or screenshot instead.');
      } else {
        setErrorMessage(`Camera error: ${err.message || 'Unable to access video feed'}.`);
      }
    }
  }, [facingMode, scanLoop, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedResult(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !torchActive;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setTorchActive(nextTorch);
      } catch (err) {
        console.warn('Torch toggle not supported:', err);
      }
    }
  };

  // Flip Camera (Front / Back)
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setErrorMessage('');

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessingImage(false);
          setErrorMessage('Could not initialize canvas for image analysis.');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsProcessingImage(false);
        if (code && code.data) {
          handleSuccessfulScan(code.data.trim());
        } else {
          setErrorMessage('No valid QR code found in the uploaded image. Please ensure the QR code is clearly visible.');
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopyResult = () => {
    if (!scannedResult) return;
    navigator.clipboard.writeText(scannedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPage = () => {
    if (!scannedResult) return;
    let url = scannedResult;
    // Check if result is relative path
    if (url.startsWith('/')) {
      url = `${window.location.origin}${url}`;
    }
    window.open(url, '_blank');
  };

  const isUrl = Boolean(
    scannedResult && (
      scannedResult.startsWith('http://') || 
      scannedResult.startsWith('https://') || 
      scannedResult.startsWith('/')
    )
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden font-sans flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/70 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                <span>Camera QR Scanner</span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono uppercase">
                  Real-Time
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Scan QR code with your camera to open the page immediately
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Scanner Viewfinder or Scan Result */}
          {!scannedResult ? (
            <div className="relative bg-black rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center min-h-[300px] shadow-inner">
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover max-h-[360px]"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Reticle */}
              {hasCameraPermission && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                    {/* Animated scanning beam */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Camera Controls Overlay */}
              {hasCameraPermission && (
                <div className="absolute bottom-3 left-0 right-0 px-4 flex items-center justify-between pointer-events-auto">
                  <button
                    onClick={flipCamera}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition"
                    title="Flip camera front/back"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>

                  <span className="text-[10px] font-mono text-white/90 bg-black/60 px-2 py-1 rounded-full border border-white/20">
                    Align QR code in frame
                  </span>

                  {hasTorch ? (
                    <button
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl border backdrop-blur-sm transition ${
                        torchActive 
                          ? 'bg-amber-500 text-slate-950 border-amber-400' 
                          : 'bg-slate-900/80 text-slate-200 border-slate-700'
                      }`}
                      title="Toggle flashlight"
                    >
                      {torchActive ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              )}

              {/* Fallback info when camera is loading or permission missing */}
              {hasCameraPermission === false && (
                <div className="p-6 text-center text-slate-400 font-mono text-xs space-y-3">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-slate-300 font-bold">Camera Inactive</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    If your camera is blocked or not detected, you can upload a screenshot or image of the QR code directly.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 mx-auto transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload QR Image / Photo</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Successful Scan Result Card */
            <div className="bg-slate-950 border border-emerald-500/60 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>QR Code Scanned Successfully!</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 break-all select-all max-h-36 overflow-y-auto">
                {scannedResult}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 font-mono text-xs">
                {isUrl && (
                  <button
                    onClick={handleOpenPage}
                    className="w-full sm:flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Page Now</span>
                  </button>
                )}

                <button
                  onClick={handleCopyResult}
                  className="w-full sm:flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Content'}</span>
                </button>

                <button
                  onClick={() => {
                    setScannedResult(null);
                    startCamera();
                  }}
                  className="w-full sm:w-auto py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition flex items-center justify-center gap-1 border border-slate-800"
                  title="Scan another code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Alternative Actions Bar */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingImage}
              className="flex items-center gap-1.5 hover:text-amber-400 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isProcessingImage ? 'Analyzing...' : 'Scan From Photo / File'}</span>
            </button>

            {currentPackageId && (
              <button
                onClick={() => {
                  const demoUrl = `${window.location.origin}/?mobile=1&pkg=${encodeURIComponent(currentPackageId)}`;
                  handleSuccessfulScan(demoUrl);
                }}
                className="text-amber-400 hover:text-amber-300 underline text-[11px]"
              >
                Test With Active Receiver Page
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
