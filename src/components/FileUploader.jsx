import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music, 
  Archive,
  X, 
  Send, 
  Download,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const FileUploader = ({ onSendFile, onCancel, isOpen, maxFileSize = 16 * 1024 * 1024 }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
    archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
  };

  const getFileIcon = (file) => {
    if (allowedTypes.image.includes(file.type)) return <ImageIcon className="w-6 h-6 text-blue-500" />;
    if (allowedTypes.document.includes(file.type)) return <FileText className="w-6 h-6 text-green-500" />;
    if (allowedTypes.video.includes(file.type)) return <Video className="w-6 h-6 text-purple-500" />;
    if (allowedTypes.audio.includes(file.type)) return <Music className="w-6 h-6 text-orange-500" />;
    if (allowedTypes.archive.includes(file.type)) return <Archive className="w-6 h-6 text-gray-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const getFileType = (file) => {
    if (allowedTypes.image.includes(file.type)) return 'image';
    if (allowedTypes.document.includes(file.type)) return 'document';
    if (allowedTypes.video.includes(file.type)) return 'video';
    if (allowedTypes.audio.includes(file.type)) return 'audio';
    if (allowedTypes.archive.includes(file.type)) return 'archive';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    const errors = [];
    
    if (file.size > maxFileSize) {
      errors.push(`File size exceeds ${formatFileSize(maxFileSize)} limit`);
    }
    
    const allAllowedTypes = Object.values(allowedTypes).flat();
    if (!allAllowedTypes.includes(file.type)) {
      errors.push('File type not supported');
    }
    
    return errors;
  };

  const handleFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).map(file => {
      const errors = validateFile(file);
      return {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        fileType: getFileType(file),
        errors,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, [maxFileSize]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleSend = async () => {
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      for (const fileData of files) {
        if (fileData.errors.length > 0) continue;
        
        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 0 }));
        
        // Simulate upload
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => ({ ...prev, [fileData.id]: progress }));
        }
        
        // Send file
        onSendFile(fileData.file, fileData.fileType);
      }
      
      // Clean up
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    // Clean up preview URLs
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setUploadProgress({});
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Upload Files</h3>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          ref={dropRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h4>
          <p className="text-gray-600 mb-4">
            or <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              browse files
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Max file size: {formatFileSize(maxFileSize)}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt,video/*,audio/*,.zip,.rar,.7z"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 max-h-60 overflow-y-auto">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h5>
            <div className="space-y-2">
              {files.map((fileData) => (
                <motion.div
                  key={fileData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {fileData.preview ? (
                      <img 
                        src={fileData.preview} 
                        alt={fileData.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(fileData.file)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {fileData.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileData.size)} • {fileData.fileType}
                    </p>
                    
                    {fileData.errors.length > 0 ? (
                      <div className="flex items-center space-x-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <p className="text-xs text-red-600">{fileData.errors[0]}</p>
                      </div>
                    ) : uploadProgress[fileData.id] !== undefined ? (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileData.id]}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadProgress[fileData.id]}% uploaded
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-green-600">Ready to send</p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          {files.length > 0 && files.every(f => f.errors.length === 0) && (
            <button
              onClick={handleSend}
              disabled={uploading}
              className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Files</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileUploader;
