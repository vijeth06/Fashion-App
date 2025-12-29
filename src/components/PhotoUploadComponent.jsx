import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUpload, 
  FaImage, 
  FaTrash, 
  FaExpand, 
  FaDownload,
  FaSpinner,
  FaExclamationTriangle 
} from 'react-icons/fa';


const PhotoUploadComponent = ({
  onImageSelect,
  onImageClear,
  onError,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = '',
  showPreview = true
}) => {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageInfo, setImageInfo] = useState(null);

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {

      if (!acceptedFormats.includes(file.type)) {
        throw new Error(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      }

      if (file.size > maxFileSize) {
        throw new Error(`File too large. Maximum size: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`);
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;

        const img = new Image();
        img.onload = () => {
          const info = {
            name: file.name,
            size: file.size,
            type: file.type,
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          };

          setSelectedImage(dataUrl);
          setImageData(dataUrl);
          setImageInfo(info);
          setIsProcessing(false);

          if (onImageSelect) {
            onImageSelect(dataUrl, info);
          }
        };
        
        img.onerror = () => {
          setError('Failed to load image. Please try a different file.');
          setIsProcessing(false);
        };
        
        img.src = dataUrl;
      };
      
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
        setIsProcessing(false);
      };
      
      reader.readAsDataURL(file);

    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      
      if (onError) {
        onError(err);
      }
    }
  }, [acceptedFormats, maxFileSize, onImageSelect, onError]);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImageData(null);
    setImageInfo(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (onImageClear) {
      onImageClear();
    }
  }, [onImageClear]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const downloadImage = useCallback(() => {
    if (!imageData || !imageInfo) return;

    const link = document.createElement('a');
    link.download = `processed-${imageInfo.name}`;
    link.href = imageData;
    link.click();
  }, [imageData, imageInfo]);

  const getImageCanvas = useCallback(() => {
    if (!selectedImage || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.src = selectedImage;
    });
  }, [selectedImage]);

  return (
    <div className={`space-y-4 ${className}`}>
      {}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${selectedImage ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <FaSpinner className="text-4xl text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Processing image...
            </p>
          </div>
        ) : selectedImage ? (
          <div className="flex flex-col items-center">
            <FaImage className="text-4xl text-green-500 mb-4" />
            <p className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">
              Image uploaded successfully!
            </p>
            {imageInfo && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {imageInfo.name} • {imageInfo.width}×{imageInfo.height} • {(imageInfo.size / 1024 / 1024).toFixed(2)}MB
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaUpload className="text-4xl text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop an image here or click to upload
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • 
              Max size: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>
        )}
      </div>

      {}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      {showPreview && selectedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Image Preview
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadImage}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Download image"
              >
                <FaDownload />
              </button>
              <button
                onClick={clearImage}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Remove image"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          {}
          <div className="relative">
            <img
              src={selectedImage}
              alt="Uploaded preview"
              className="w-full max-h-96 object-contain bg-gray-50 dark:bg-gray-900"
            />
            
            {}
            {imageInfo && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <span>{imageInfo.width}×{imageInfo.height}</span>
                  <span>•</span>
                  <span>{(imageInfo.size / 1024 / 1024).toFixed(2)}MB</span>
                  <span>•</span>
                  <span>Ratio: {imageInfo.aspectRatio.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ready for virtual try-on
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Upload Different Image
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoUploadComponent;