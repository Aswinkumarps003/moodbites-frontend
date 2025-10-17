import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Download, 
  Eye, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music, 
  Archive,
  Volume2,
  VolumeX,
  Check,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

const MessageBubble = ({ message, isOwn, senderName, senderAvatar, onFileDownload }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateProgress = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      
      const handleLoadedMetadata = () => {
        setAudioDuration(audio.duration);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };
      
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [message.audioUrl]);

  const handleAudioPlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioSeek = (e) => {
    if (audioRef.current && audioDuration) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * audioDuration;
      
      audioRef.current.currentTime = newTime;
      setAudioProgress(percentage * 100);
    }
  };

  const handleFileDownload = () => {
    if (onFileDownload && message.fileUrl) {
      onFileDownload(message.fileUrl, message.fileName);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'document': return <FileText className="w-5 h-5 text-green-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio': return <Music className="w-5 h-5 text-orange-500" />;
      case 'archive': return <Archive className="w-5 h-5 text-gray-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'audio':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAudioPlay}
                className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">Voice Message</span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>
                
                <div 
                  ref={progressRef}
                  onClick={handleAudioSeek}
                  className="w-full h-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                >
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-100"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
              </div>
            </div>
            
            {message.audioUrl && (
              <audio
                ref={audioRef}
                src={message.audioUrl}
                muted={isMuted}
                className="hidden"
              />
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            {message.fileType === 'image' && message.fileUrl ? (
              // WhatsApp-style image preview
              <div className="relative group">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={message.fileUrl} 
                    alt={message.fileName}
                    className="w-full max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowImagePreview(true)}
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                  />
                  {/* Overlay with file info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {message.fileName}
                    </p>
                    <p className="text-white/80 text-xs">
                      {formatFileSize(message.fileSize)}
                    </p>
                  </div>
                  {/* Download button overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleFileDownload}
                      className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Non-image file display
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getFileIcon(message.fileType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {message.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(message.fileSize)} • {message.fileType}
                  </p>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleFileDownload}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        );
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
          {!isOwn && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {senderAvatar ? (
                <img 
                  src={senderAvatar} 
                  alt={senderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {senderName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          )}
          
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg ${
              isOwn
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'bg-white text-gray-800 border border-gray-200'
            }`}
          >
            {renderMessageContent()}
            
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs ${
                isOwn ? 'text-indigo-100' : 'text-gray-500'
              }`}>
                {message.time}
              </p>
              {isOwn && (
                <div className="ml-2">
                  {message.isRead ? (
                    <CheckCheck className="w-3 h-3 text-indigo-200" />
                  ) : (
                    <Check className="w-3 h-3 text-indigo-200" />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isOwn && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {senderAvatar ? (
                <img 
                  src={senderAvatar} 
                  alt={senderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-pink-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                  {senderName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      {showImagePreview && message.fileUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowImagePreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={message.fileUrl} 
              alt={message.fileName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={message.fileUrl}
        fileName={message.fileName}
        fileSize={message.fileSize}
        onDownload={() => onFileDownload(message.fileUrl, message.fileName)}
        onPrevious={() => {}}
        onNext={() => {}}
        hasPrevious={false}
        hasNext={false}
        currentIndex={0}
        totalImages={1}
      />
    </>
  );
};

export default MessageBubble;
