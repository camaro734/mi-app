import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, SwitchCamera, Image, X, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const startCamera = useCallback(async (facing) => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err) {
      setCameraError(
        'No se pudo acceder a la cámara. Asegúrate de dar permiso de cámara o sube una foto.'
      );
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);

    // Stop camera when photo is captured
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const analyzePhoto = () => {
    setIsScanning(true);
    // Save captured image to sessionStorage for reference
    if (capturedImage) {
      sessionStorage.setItem('capturedFoodImage', capturedImage);
    }
    // Simulate a brief analysis animation then navigate to search
    setTimeout(() => {
      navigate('/search?from=camera');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {!capturedImage ? (
        <>
          {/* Camera View */}
          <div className="flex-1 relative">
            {cameraError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-white text-lg mb-6">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Subir foto desde galería
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 camera-overlay pointer-events-none" />

            {/* Scan Frame */}
            {!cameraError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 relative">
                  {/* Corner borders */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                  {/* Scan line */}
                  <div className="absolute inset-x-2 h-0.5 bg-green-400 scan-line opacity-80" />
                </div>
              </div>
            )}

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <button
                onClick={() => {
                  if (stream) stream.getTracks().forEach((t) => t.stop());
                  navigate(-1);
                }}
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
                <p className="text-white text-sm font-medium">Enfoca el alimento</p>
              </div>
              {!cameraError && (
                <button
                  onClick={toggleCamera}
                  className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <SwitchCamera className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="bg-black/90 backdrop-blur-sm p-6 pb-10">
            <div className="flex items-center justify-around">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"
              >
                <Image className="w-6 h-6 text-white" />
              </button>
              {!cameraError && (
                <button
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white active:bg-gray-200 transition-colors" />
                </button>
              )}
              <div className="w-14 h-14" />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Captured Image View */}
          <div className="flex-1 relative">
            <img
              src={capturedImage}
              alt="Captura"
              className="w-full h-full object-cover"
            />

            {/* Scanning overlay */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-white text-lg font-medium">Analizando alimento...</p>
                  <p className="text-green-300 text-sm mt-2">Buscando en base de datos</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top bar */}
            {!isScanning && (
              <div className="absolute top-0 left-0 right-0 p-4">
                <button
                  onClick={retakePhoto}
                  className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {!isScanning && (
            <div className="bg-black/90 backdrop-blur-sm p-6 pb-10 space-y-3">
              <button
                onClick={analyzePhoto}
                className="w-full safe-gradient text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3"
              >
                <Zap className="w-6 h-6" />
                Identificar alimento
              </button>
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 bg-white/20 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Repetir foto
                </button>
                <button
                  onClick={() => {
                    if (capturedImage) {
                      sessionStorage.setItem('capturedFoodImage', capturedImage);
                    }
                    navigate('/search?from=camera');
                  }}
                  className="flex-1 bg-white/20 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Buscar manual
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
