import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Share2,
  Info
} from 'lucide-react';

const ImagePreviewModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  fileName, 
  fileSize, 
  onDownload,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalImages
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setImageLoaded(false);
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious) onPrevious();
          break;
        case 'ArrowRight':
          if (hasNext) onNext();
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 0.25, 3));
          break;
        case '-':
          setZoom(prev => Math.max(prev - 0.25, 0.25));
          break;
        case 'r':
        case 'R':
          setRotation(prev => (prev + 90) % 360);
          break;
        case 'f':
        case 'F':
          setIsFullscreen(prev => !prev);
          break;
        case 'i':
        case 'I':
          setShowInfo(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrevious, hasNext, onPrevious, onNext, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 ${
          isFullscreen ? 'p-0' : 'p-4'
        }`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ${
            isFullscreen ? 'w-full h-full rounded-none' : 'max-w-6xl max-h-[90vh] w-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-white">
                  <h3 className="font-semibold truncate max-w-xs">{fileName}</h3>
                  <p className="text-sm text-white/80">{formatFileSize(fileSize)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  title="Info (I)"
                >
                  <Info className="w-5 h-5" />
                </button>
                <button
                  onClick={onDownload}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={handleFullscreen}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            )}
            
            <img
              src={imageUrl}
              alt={fileName}
              className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                cursor: zoom > 1 ? 'grab' : 'default'
              }}
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />
          </div>

          {/* Navigation Arrows */}
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Previous (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Next (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-sm font-medium">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  title="Reset Zoom"
                >
                  <span className="text-sm font-bold">1:1</span>
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  title="Rotate (R)"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-white text-sm">
                {currentIndex + 1} of {totalImages}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-16 right-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg max-w-xs"
              >
                <h4 className="font-semibold mb-2">Image Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-white/70">Name:</span> {fileName}</p>
                  <p><span className="text-white/70">Size:</span> {formatFileSize(fileSize)}</p>
                  <p><span className="text-white/70">Zoom:</span> {Math.round(zoom * 100)}%</p>
                  <p><span className="text-white/70">Rotation:</span> {rotation}°</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-xs text-white/70">
                    Use keyboard shortcuts: ← → for navigation, +/- for zoom, R for rotate, F for fullscreen
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImagePreviewModal;


